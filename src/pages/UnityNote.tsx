import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coins, TrendingUp, Users, Clock, Star, ArrowUpRight, ArrowDownLeft, Plus, Gift } from "lucide-react";
import { User, UnityNoteTransaction, ServiceOffer, STORAGE, save, load } from "@/lib/storage";
import { useLanguage } from "@/contexts/LanguageContext";
import { ServiceRequestDialog } from "@/components/ServiceRequestDialog";
import { ServiceOfferDialog } from "@/components/ServiceOfferDialog";
import { toast } from "sonner";

interface UnityNoteProps {
  currentUser: User;
  users: User[];
  onSignOut: () => void;
}

const UnityNote = ({ currentUser, users, onSignOut }: UnityNoteProps) => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<UnityNoteTransaction[]>(
    load<UnityNoteTransaction[]>(STORAGE.UNITY_TRANSACTIONS, [])
  );
  const [serviceOffers, setServiceOffers] = useState<ServiceOffer[]>(
    load<ServiceOffer[]>(STORAGE.SERVICE_OFFERS, [])
  );
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  const userBalance = currentUser.unityBalance || 5; // Initial 5 Unity Notes
  const userEarned = currentUser.unityEarned || 0;
  const userSpent = currentUser.unitySpent || 0;

  const userTransactions = transactions.filter(
    t => t.fromUserId === currentUser.id || t.toUserId === currentUser.id
  );

  const getUserById = (id: string) => users.find(u => u.id === id);

  const handleServiceRequest = (data: Omit<UnityNoteTransaction, 'id' | 'createdAt' | 'fromUserId'>) => {
    const newTransaction: UnityNoteTransaction = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fromUserId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    save(STORAGE.UNITY_TRANSACTIONS, updatedTransactions);
    
    toast.success(t("Service request sent successfully!", "সেবা অনুরোধ সফলভাবে পাঠানো হয়েছে!"));
    setRequestDialogOpen(false);
  };

  const handleServiceOffer = (data: Omit<ServiceOffer, 'id' | 'createdAt' | 'userId'>) => {
    const newOffer: ServiceOffer = {
      ...data,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    const updatedOffers = [...serviceOffers, newOffer];
    setServiceOffers(updatedOffers);
    save(STORAGE.SERVICE_OFFERS, updatedOffers);
    
    toast.success(t("Service offer posted successfully!", "সেবা অফার সফলভাবে পোস্ট হয়েছে!"));
    setOfferDialogOpen(false);
  };

  const completeTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const updatedTransactions = transactions.map(t => 
      t.id === transactionId 
        ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
        : t
    );
    
    setTransactions(updatedTransactions);
    save(STORAGE.UNITY_TRANSACTIONS, updatedTransactions);
    
    toast.success(t("Transaction completed!", "লেনদেন সম্পন্ন হয়েছে!"));
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">Unity Note</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            {t("মানবতার মুদ্রা - A Currency of Humanity", "মানবতার মুদ্রা - A Currency of Humanity")}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("Where time, service, and cooperation are real wealth", "যেখানে মানুষের সময়, সেবা ও সহযোগিতাই হবে আসল সম্পদ")}
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Coins className="w-4 h-4" />
                {t("Current Balance", "বর্তমান ব্যালেন্স")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{userBalance}</div>
              <p className="text-xs text-muted-foreground mt-1">Unity Notes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-green-500" />
                {t("Total Earned", "মোট আয়")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{userEarned}</div>
              <p className="text-xs text-muted-foreground mt-1">Unity Notes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-orange-500" />
                {t("Total Spent", "মোট ব্যয়")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{userSpent}</div>
              <p className="text-xs text-muted-foreground mt-1">Unity Notes</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Button onClick={() => setRequestDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            {t("Request Service", "সেবা অনুরোধ করুন")}
          </Button>
          <Button onClick={() => setOfferDialogOpen(true)} size="lg" variant="secondary" className="gap-2">
            <Gift className="w-4 h-4" />
            {t("Offer Service", "সেবা প্রদান করুন")}
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="marketplace">
              {t("Marketplace", "মার্কেটপ্লেস")}
            </TabsTrigger>
            <TabsTrigger value="transactions">
              {t("Transactions", "লেনদেন")}
            </TabsTrigger>
            <TabsTrigger value="about">
              {t("About", "সম্পর্কে")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("Available Services", "উপলব্ধ সেবা")}</CardTitle>
                <CardDescription>
                  {t("Services offered by community members", "কমিউনিটি সদস্যদের দ্বারা প্রদত্ত সেবা")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {serviceOffers.length === 0 ? (
                    <p className="text-muted-foreground col-span-2 text-center py-8">
                      {t("No services available yet", "এখনো কোন সেবা উপলব্ধ নেই")}
                    </p>
                  ) : (
                    serviceOffers.map(offer => {
                      const provider = getUserById(offer.userId);
                      return (
                        <Card key={offer.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={provider?.profileImage} />
                                  <AvatarFallback>{provider?.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">{offer.title}</CardTitle>
                                  <p className="text-sm text-muted-foreground">{provider?.name}</p>
                                </div>
                              </div>
                              <Badge>{offer.category}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm mb-4">{offer.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Coins className="w-4 h-4 text-primary" />
                                <span className="font-bold">{offer.ratePerHour} UN/hr</span>
                              </div>
                              <Button size="sm" onClick={() => setRequestDialogOpen(true)}>
                                {t("Request", "অনুরোধ")}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("Transaction History", "লেনদেন ইতিহাস")}</CardTitle>
                <CardDescription>
                  {t("Your Unity Note transactions", "আপনার Unity Note লেনদেন")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userTransactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      {t("No transactions yet", "এখনো কোন লেনদেন নেই")}
                    </p>
                  ) : (
                    userTransactions.map(transaction => {
                      const isReceiver = transaction.toUserId === currentUser.id;
                      const otherUser = getUserById(
                        isReceiver ? transaction.fromUserId : transaction.toUserId
                      );
                      
                      return (
                        <Card key={transaction.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                {isReceiver ? (
                                  <ArrowUpRight className="w-5 h-5 text-green-500" />
                                ) : (
                                  <ArrowDownLeft className="w-5 h-5 text-orange-500" />
                                )}
                                <div>
                                  <p className="font-medium">
                                    {isReceiver ? t("Received from", "প্রাপ্ত হয়েছে") : t("Sent to", "পাঠানো হয়েছে")}{" "}
                                    {otherUser?.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {transaction.duration}h
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Badge variant={
                                        transaction.status === 'completed' ? 'default' :
                                        transaction.status === 'pending' ? 'secondary' : 'destructive'
                                      }>
                                        {transaction.status}
                                      </Badge>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-xl font-bold ${isReceiver ? 'text-green-600' : 'text-orange-600'}`}>
                                  {isReceiver ? '+' : '-'}{transaction.amount}
                                </p>
                                <p className="text-xs text-muted-foreground">Unity Notes</p>
                                {transaction.status === 'pending' && isReceiver && (
                                  <Button 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => completeTransaction(transaction.id)}
                                  >
                                    {t("Complete", "সম্পন্ন")}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("About Unity Note", "Unity Note সম্পর্কে")}</CardTitle>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none">
                <h3>{t("Vision", "দৃষ্টিভঙ্গি")}</h3>
                <p>
                  {t(
                    "Unity Note is an alternative currency system where time, service, and cooperation become real wealth. It's not just economic transactions, but a tool to strengthen human bonds.",
                    "Unity Note হবে একটি বিকল্প মুদ্রা ব্যবস্থা যা মানুষের মধ্যে পারস্পরিক সহায়তা, সময় ও দক্ষতা বিনিময়ের মাধ্যম হিসেবে কাজ করবে। এটি শুধু অর্থনৈতিক লেনদেন নয়, বরং মানবিক বন্ধন শক্তিশালী করার একটি হাতিয়ার।"
                  )}
                </p>

                <h3>{t("Core Principles", "মূল নীতিমালা")}</h3>
                <ul>
                  <li>
                    <strong>{t("Equality", "সমতা")}:</strong>{" "}
                    {t("Every person's 1 hour = 1 Unity Note", "প্রতিটি মানুষের ১ ঘণ্টা সময় = ১ Unity Note")}
                  </li>
                  <li>
                    <strong>{t("Mutual Cooperation", "পারস্পরিক সহযোগিতা")}:</strong>{" "}
                    {t("Help others, earn Unity Notes, use them to get help", "অন্যদের সাহায্য করুন, Unity Note পান, সেবা নিন")}
                  </li>
                  <li>
                    <strong>{t("Local Empowerment", "স্থানীয় শক্তি")}:</strong>{" "}
                    {t("Each community can run their own Unity Note system", "প্রতিটি কমিউনিটি নিজস্ব Unity Note সিস্টেম চালাতে পারবে")}
                  </li>
                  <li>
                    <strong>{t("Transparency", "স্বচ্ছতা")}:</strong>{" "}
                    {t("All transactions are recorded, no corruption possible", "সব লেনদেন রেকর্ড থাকবে, কোনো দুর্নীতির সুযোগ নেই")}
                  </li>
                </ul>

                <h3>{t("How It Works", "কীভাবে কাজ করবে")}</h3>
                <ol>
                  <li>{t("Sign up and get 5 Welcome Unity Notes", "সাইন আপ করুন এবং ৫টি স্বাগত Unity Note পান")}</li>
                  <li>{t("Offer your services to the community", "কমিউনিটিতে আপনার সেবা প্রদান করুন")}</li>
                  <li>{t("Earn Unity Notes for your time and work", "আপনার সময় ও কাজের জন্য Unity Note অর্জন করুন")}</li>
                  <li>{t("Use Unity Notes to request services from others", "অন্যদের কাছ থেকে সেবা নিতে Unity Note ব্যবহার করুন")}</li>
                  <li>{t("Rate and review each transaction", "প্রতিটি লেনদেনে রেটিং ও রিভিউ দিন")}</li>
                </ol>

                <div className="bg-primary/10 p-4 rounded-lg mt-6">
                  <p className="font-bold text-center">
                    {t('"Where trust exists, everything is possible."', '"যেখানে বিশ্বাস আছে, সেখানেই সম্ভব।"')}
                  </p>
                  <p className="text-center text-sm mt-2">— Tozammel for Unity</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Community Statistics", "কমিউনিটি পরিসংখ্যান")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{users.length}</p>
                    <p className="text-sm text-muted-foreground">{t("Members", "সদস্য")}</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{transactions.length}</p>
                    <p className="text-sm text-muted-foreground">{t("Transactions", "লেনদেন")}</p>
                  </div>
                  <div className="text-center">
                    <Coins className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{serviceOffers.length}</p>
                    <p className="text-sm text-muted-foreground">{t("Services", "সেবা")}</p>
                  </div>
                  <div className="text-center">
                    <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-muted-foreground">{t("Avg Rating", "গড় রেটিং")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ServiceRequestDialog 
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          onSubmit={handleServiceRequest}
          users={users.filter(u => u.id !== currentUser.id)}
        />

        <ServiceOfferDialog 
          open={offerDialogOpen}
          onOpenChange={setOfferDialogOpen}
          onSubmit={handleServiceOffer}
        />
    </main>
  );
};

export default UnityNote;
