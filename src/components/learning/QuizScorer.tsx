import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Trophy, Sparkles, BookOpen, RotateCcw } from 'lucide-react';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ParsedQuestion {
  id: number;
  question: string;
  type: 'mcq' | 'truefalse' | 'fillinblank';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuizScorerProps {
  content: string;
  onClose?: () => void;
}

export const QuizScorer = ({ content, onClose }: QuizScorerProps) => {
  const { user } = useAuth();
  const { saveQuizResult } = useLearningProgress();
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });
  const [quizTopic, setQuizTopic] = useState('Quiz');
  const [saved, setSaved] = useState(false);

  // Parse quiz content from AI response
  useEffect(() => {
    parseQuizContent(content);
  }, [content]);

  const parseQuizContent = (text: string) => {
    const lines = text.split('\n');
    const parsedQuestions: ParsedQuestion[] = [];
    let currentQuestion: Partial<ParsedQuestion> | null = null;
    let questionId = 0;
    let inExplanation = false;

    // Extract quiz topic from header
    const topicMatch = text.match(/##\s*📝\s*Quiz:\s*(.+)/i) || text.match(/##\s*🎯.*Quiz.*:\s*(.+)/i);
    if (topicMatch) {
      setQuizTopic(topicMatch[1].trim());
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect new question
      const questionMatch = line.match(/^###\s*Question\s*(\d+)/i) || 
                           line.match(/^###\s*প্রশ্ন\s*(\d+)/i) ||
                           line.match(/^\*\*\s*(\d+)\.\s*(.+)\*\*/);
      
      if (questionMatch) {
        if (currentQuestion && currentQuestion.question) {
          parsedQuestions.push(currentQuestion as ParsedQuestion);
        }
        questionId++;
        const questionType = detectQuestionType(line, lines.slice(i, i + 10).join('\n'));
        currentQuestion = {
          id: questionId,
          question: '',
          type: questionType,
          options: [],
          correctAnswer: '',
          explanation: ''
        };
        inExplanation = false;
        continue;
      }

      // Detect question text (bold text after question header)
      const boldQuestionMatch = line.match(/^\*\*(.+)\*\*$/);
      if (boldQuestionMatch && currentQuestion && !currentQuestion.question) {
        currentQuestion.question = boldQuestionMatch[1].replace(/\*\*/g, '').trim();
        continue;
      }

      // Detect MCQ options (A), B), C), D) or A. B. C. D.)
      const optionMatch = line.match(/^([A-D])[)\.\]]\s*(.+)$/i);
      if (optionMatch && currentQuestion) {
        currentQuestion.options = currentQuestion.options || [];
        currentQuestion.options.push(`${optionMatch[1].toUpperCase()}) ${optionMatch[2].trim()}`);
        continue;
      }

      // Detect True/False options
      const tfMatch = line.match(/^[⭕-]\s*(True|False|সত্য|মিথ্যা)/i);
      if (tfMatch && currentQuestion) {
        if (currentQuestion.type === 'truefalse') {
          currentQuestion.options = currentQuestion.options || [];
          if (!currentQuestion.options.includes('True (সত্য)')) {
            currentQuestion.options = ['True (সত্য)', 'False (মিথ্যা)'];
          }
        }
        continue;
      }

      // Detect correct answer in details/summary
      const answerMatch = line.match(/\*\*সঠিক উত্তর:\*\*\s*(.+)/i) ||
                         line.match(/\*\*Correct Answer:\*\*\s*(.+)/i) ||
                         line.match(/সঠিক উত্তর:\s*(.+)/);
      if (answerMatch && currentQuestion) {
        currentQuestion.correctAnswer = answerMatch[1].trim()
          .replace(/^\*\*/, '')
          .replace(/\*\*$/, '')
          .replace(/^([A-D])\)?\s*/, '$1');
        continue;
      }

      // Detect explanation
      const explanationMatch = line.match(/\*\*ব্যাখ্যা:\*\*\s*(.+)/i) ||
                              line.match(/\*\*Explanation:\*\*\s*(.+)/i);
      if (explanationMatch && currentQuestion) {
        currentQuestion.explanation = explanationMatch[1].trim();
        inExplanation = true;
        continue;
      }

      // Continue explanation
      if (inExplanation && currentQuestion && line && !line.startsWith('---') && !line.startsWith('#')) {
        currentQuestion.explanation += ' ' + line;
      }

      // Detect fill in the blank question
      if (line.includes('_____') || line.includes('______')) {
        if (currentQuestion && !currentQuestion.question) {
          currentQuestion.question = line.replace(/\*\*/g, '');
          currentQuestion.type = 'fillinblank';
        }
      }
    }

    // Add last question
    if (currentQuestion && currentQuestion.question) {
      parsedQuestions.push(currentQuestion as ParsedQuestion);
    }

    // Clean up and validate
    const validQuestions = parsedQuestions.filter(q => 
      q.question && 
      q.correctAnswer && 
      (q.type !== 'mcq' || (q.options && q.options.length >= 2))
    );

    setQuestions(validQuestions);
  };

  const detectQuestionType = (line: string, context: string): 'mcq' | 'truefalse' | 'fillinblank' => {
    const lowerLine = line.toLowerCase();
    const lowerContext = context.toLowerCase();
    
    if (lowerLine.includes('true/false') || lowerLine.includes('সত্য/মিথ্যা') || 
        lowerContext.includes('⭕ true') || lowerContext.includes('⭕ false')) {
      return 'truefalse';
    }
    if (lowerLine.includes('fill in') || lowerLine.includes('blank') || 
        lowerContext.includes('_____')) {
      return 'fillinblank';
    }
    return 'mcq';
  };

  const handleAnswer = (questionId: number, answer: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const submitQuiz = async () => {
    if (questions.length === 0) return;

    let correct = 0;
    questions.forEach(q => {
      const userAnswer = answers[q.id] || '';
      const correctAnswer = q.correctAnswer.toLowerCase().trim();
      const normalizedUserAnswer = userAnswer.toLowerCase().trim();
      
      // Check for correct answer match
      if (q.type === 'mcq') {
        // Extract just the letter for MCQ
        const userLetter = normalizedUserAnswer.charAt(0);
        const correctLetter = correctAnswer.charAt(0);
        if (userLetter === correctLetter) correct++;
      } else if (q.type === 'truefalse') {
        if (normalizedUserAnswer.includes('true') && correctAnswer.includes('true')) correct++;
        else if (normalizedUserAnswer.includes('false') && correctAnswer.includes('false')) correct++;
      } else {
        // Fill in blank - partial match
        if (correctAnswer.includes(normalizedUserAnswer) || normalizedUserAnswer.includes(correctAnswer)) {
          correct++;
        }
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    setScore({ correct, total: questions.length, percentage });
    setSubmitted(true);

    // Save to database if user is logged in
    if (user && !saved) {
      await saveQuizResult(quizTopic, 'chat', questions.length, correct);
      setSaved(true);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore({ correct: 0, total: 0, percentage: 0 });
    setSaved(false);
  };

  const isCorrect = (questionId: number): boolean | null => {
    if (!submitted) return null;
    const question = questions.find(q => q.id === questionId);
    if (!question) return null;
    
    const userAnswer = (answers[questionId] || '').toLowerCase().trim();
    const correctAnswer = question.correctAnswer.toLowerCase().trim();
    
    if (question.type === 'mcq') {
      return userAnswer.charAt(0) === correctAnswer.charAt(0);
    } else if (question.type === 'truefalse') {
      return (userAnswer.includes('true') && correctAnswer.includes('true')) ||
             (userAnswer.includes('false') && correctAnswer.includes('false'));
    }
    return correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer);
  };

  if (questions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{quizTopic}</h3>
          <span className="text-sm text-muted-foreground">({questions.length} questions)</span>
        </div>
        {submitted && (
          <Button variant="ghost" size="sm" onClick={resetQuiz} className="gap-1">
            <RotateCcw className="h-4 w-4" />
            আবার চেষ্টা
          </Button>
        )}
      </div>

      {/* Score display when submitted */}
      {submitted && (
        <div className="mb-6 p-4 rounded-xl bg-background border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className={cn(
                "h-6 w-6",
                score.percentage >= 80 ? "text-yellow-500" :
                score.percentage >= 50 ? "text-blue-500" : "text-muted-foreground"
              )} />
              <span className="text-2xl font-bold">{score.percentage}%</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {score.correct}/{score.total} সঠিক
              </p>
              {saved && user && (
                <p className="text-xs text-green-600 flex items-center gap-1 justify-end">
                  <Sparkles className="h-3 w-3" />
                  Progress এ সেভ হয়েছে!
                </p>
              )}
              {!user && (
                <p className="text-xs text-amber-600">
                  সেভ করতে লগইন করুন
                </p>
              )}
            </div>
          </div>
          <Progress value={score.percentage} className="h-2" />
          <p className="text-center mt-2 text-sm font-medium">
            {score.percentage >= 80 ? "🏆 অসাধারণ! তুমি চ্যাম্পিয়ন!" :
             score.percentage >= 60 ? "🌟 খুব ভালো! আরো একটু প্র্যাক্টিস করো!" :
             score.percentage >= 40 ? "👍 ভালো চেষ্টা! আরো পড়াশোনা করো!" :
             "💪 হাল ছেড়ো না! আবার চেষ্টা করো!"}
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const correct = isCorrect(q.id);
          
          return (
            <div 
              key={q.id} 
              className={cn(
                "p-3 rounded-lg border transition-colors",
                submitted && correct === true && "border-green-500/50 bg-green-500/5",
                submitted && correct === false && "border-red-500/50 bg-red-500/5",
                !submitted && "border-border"
              )}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground shrink-0">
                  {idx + 1}.
                </span>
                <p className="text-sm font-medium flex-1">{q.question}</p>
                {submitted && (
                  correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  )
                )}
              </div>

              {/* MCQ Options */}
              {q.type === 'mcq' && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-5">
                  {q.options.map((opt, i) => {
                    const optionLetter = opt.charAt(0);
                    const isSelected = answers[q.id]?.charAt(0) === optionLetter;
                    const isCorrectOption = q.correctAnswer.charAt(0).toUpperCase() === optionLetter;
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(q.id, optionLetter)}
                        disabled={submitted}
                        className={cn(
                          "text-left text-sm p-2 rounded-lg border transition-all",
                          !submitted && isSelected && "border-primary bg-primary/10",
                          !submitted && !isSelected && "border-border hover:border-primary/50",
                          submitted && isCorrectOption && "border-green-500 bg-green-500/10",
                          submitted && isSelected && !isCorrectOption && "border-red-500 bg-red-500/10"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False Options */}
              {q.type === 'truefalse' && (
                <div className="flex gap-2 ml-5">
                  {['True (সত্য)', 'False (মিথ্যা)'].map((opt) => {
                    const isTrue = opt.includes('True');
                    const isSelected = answers[q.id] === opt;
                    const isCorrectOption = isTrue 
                      ? q.correctAnswer.toLowerCase().includes('true')
                      : q.correctAnswer.toLowerCase().includes('false');
                    
                    return (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(q.id, opt)}
                        disabled={submitted}
                        className={cn(
                          "text-sm px-4 py-2 rounded-lg border transition-all",
                          !submitted && isSelected && "border-primary bg-primary/10",
                          !submitted && !isSelected && "border-border hover:border-primary/50",
                          submitted && isCorrectOption && "border-green-500 bg-green-500/10",
                          submitted && isSelected && !isCorrectOption && "border-red-500 bg-red-500/10"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fill in blank */}
              {q.type === 'fillinblank' && (
                <div className="ml-5">
                  <input
                    type="text"
                    placeholder="উত্তর লিখুন..."
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    disabled={submitted}
                    className={cn(
                      "w-full max-w-xs px-3 py-2 text-sm rounded-lg border",
                      submitted && correct && "border-green-500 bg-green-500/10",
                      submitted && !correct && "border-red-500 bg-red-500/10",
                      !submitted && "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                    )}
                  />
                  {submitted && !correct && (
                    <p className="text-xs text-green-600 mt-1">
                      সঠিক উত্তর: {q.correctAnswer}
                    </p>
                  )}
                </div>
              )}

              {/* Explanation */}
              {submitted && q.explanation && (
                <div className="mt-2 ml-5 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                  <strong>ব্যাখ্যা:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted && (
        <div className="mt-4 flex justify-center">
          <Button 
            onClick={submitQuiz}
            disabled={Object.keys(answers).length === 0}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            স্কোর দেখুন
          </Button>
        </div>
      )}
    </Card>
  );
};

// Utility to detect if content contains a quiz
export const hasQuizContent = (content: string): boolean => {
  const quizIndicators = [
    /##\s*📝\s*Quiz/i,
    /##\s*🎯.*Quiz/i,
    /###\s*Question\s*\d+/i,
    /###\s*প্রশ্ন\s*\d+/i,
    /\*\*সঠিক উত্তর:\*\*/i,
    /\*\*Correct Answer:\*\*/i,
    /<details>/i,
    /True\/False/i,
    /MCQ/i
  ];
  
  return quizIndicators.some(pattern => pattern.test(content)) &&
         (content.includes('A)') || content.includes('A.') || content.includes('True') || content.includes('সত্য'));
};
