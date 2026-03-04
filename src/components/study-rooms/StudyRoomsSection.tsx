import { useState } from 'react';
import { useStudyRooms, useStudyRoomDetail } from '@/hooks/useStudyRooms';
import { StudyRoomsList } from './StudyRoomsList';
import { StudyRoomDetail } from './StudyRoomDetail';

interface StudyRoomsSectionProps {
  userId: string | null;
  onRequestQuiz?: (topic: string) => void;
}

export function StudyRoomsSection({ userId, onRequestQuiz }: StudyRoomsSectionProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  const { rooms, loading, createRoom, joinRoom, leaveRoom } = useStudyRooms(userId);
  const { 
    room, 
    members, 
    messages, 
    notes, 
    loading: roomLoading, 
    sendMessage, 
    addNote 
  } = useStudyRoomDetail(selectedRoomId, userId);

  const handleRequestQuiz = (topic: string) => {
    if (onRequestQuiz) {
      onRequestQuiz(topic);
    }
  };

  if (selectedRoomId) {
    return (
      <StudyRoomDetail
        room={room}
        members={members}
        messages={messages}
        notes={notes}
        loading={roomLoading}
        userId={userId}
        onBack={() => setSelectedRoomId(null)}
        onSendMessage={sendMessage}
        onAddNote={addNote}
        onRequestQuiz={handleRequestQuiz}
      />
    );
  }

  return (
    <StudyRoomsList
      rooms={rooms}
      loading={loading}
      userId={userId}
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
      onSelectRoom={setSelectedRoomId}
    />
  );
}
