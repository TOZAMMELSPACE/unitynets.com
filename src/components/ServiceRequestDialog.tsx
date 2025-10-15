import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, UnityNoteTransaction } from "@/lib/storage";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<UnityNoteTransaction, 'id' | 'createdAt' | 'fromUserId'>) => void;
  users: User[];
}

export const ServiceRequestDialog = ({ open, onOpenChange, onSubmit, users }: ServiceRequestDialogProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    toUserId: '',
    serviceType: '',
    description: '',
    duration: 1,
    amount: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: 'pending',
    });
    setFormData({ toUserId: '', serviceType: '', description: '', duration: 1, amount: 1 });
  };

  const serviceCategories = [
    { value: 'education', label: t('Education & Training', 'শিক্ষা ও প্রশিক্ষণ') },
    { value: 'health', label: t('Health & Wellness', 'স্বাস্থ্য ও সুস্থতা') },
    { value: 'agriculture', label: t('Agriculture', 'কৃষি') },
    { value: 'repair', label: t('Repair & Maintenance', 'মেরামত ও রক্ষণাবেক্ষণ') },
    { value: 'transport', label: t('Transport', 'পরিবহন') },
    { value: 'household', label: t('Household Work', 'গৃহস্থালী কাজ') },
    { value: 'technology', label: t('Technology', 'প্রযুক্তি') },
    { value: 'other', label: t('Other', 'অন্যান্য') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Request Service', 'সেবা অনুরোধ করুন')}</DialogTitle>
          <DialogDescription>
            {t('Request a service from community members', 'কমিউনিটি সদস্যদের কাছ থেকে সেবা অনুরোধ করুন')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('Select Provider', 'প্রদানকারী নির্বাচন করুন')}</Label>
            <Select value={formData.toUserId} onValueChange={(value) => setFormData({ ...formData, toUserId: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t('Choose a member', 'একজন সদস্য বেছে নিন')} />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} (Trust: {user.trustScore})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('Service Category', 'সেবার ধরন')}</Label>
            <Select value={formData.serviceType} onValueChange={(value) => setFormData({ ...formData, serviceType: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t('Select category', 'ক্যাটাগরি নির্বাচন করুন')} />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('Description', 'বিবরণ')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('Describe what you need...', 'আপনার কী প্রয়োজন তা বর্ণনা করুন...')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('Duration (hours)', 'সময়কাল (ঘণ্টা)')}</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.duration}
                onChange={(e) => {
                  const duration = parseFloat(e.target.value);
                  setFormData({ ...formData, duration, amount: duration });
                }}
                required
              />
            </div>

            <div>
              <Label>{t('Amount (Unity Notes)', 'পরিমাণ (Unity Notes)')}</Label>
              <Input
                type="number"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('Cancel', 'বাতিল')}
            </Button>
            <Button type="submit" disabled={!formData.toUserId || !formData.serviceType || !formData.description}>
              {t('Send Request', 'অনুরোধ পাঠান')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
