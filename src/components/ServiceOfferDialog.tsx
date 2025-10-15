import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ServiceOffer } from "@/lib/storage";
import { useLanguage } from "@/contexts/LanguageContext";

interface ServiceOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<ServiceOffer, 'id' | 'createdAt' | 'userId'>) => void;
}

export const ServiceOfferDialog = ({ open, onOpenChange, onSubmit }: ServiceOfferDialogProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ratePerHour: 1,
    availability: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', description: '', category: '', ratePerHour: 1, availability: [] });
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

  const days = [
    { value: 'monday', label: t('Monday', 'সোমবার') },
    { value: 'tuesday', label: t('Tuesday', 'মঙ্গলবার') },
    { value: 'wednesday', label: t('Wednesday', 'বুধবার') },
    { value: 'thursday', label: t('Thursday', 'বৃহস্পতিবার') },
    { value: 'friday', label: t('Friday', 'শুক্রবার') },
    { value: 'saturday', label: t('Saturday', 'শনিবার') },
    { value: 'sunday', label: t('Sunday', 'রবিবার') },
  ];

  const toggleDay = (day: string) => {
    setFormData({
      ...formData,
      availability: formData.availability.includes(day)
        ? formData.availability.filter(d => d !== day)
        : [...formData.availability, day]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('Offer Service', 'সেবা প্রদান করুন')}</DialogTitle>
          <DialogDescription>
            {t('Post a service you can provide to the community', 'কমিউনিটিতে আপনি যে সেবা দিতে পারবেন তা পোস্ট করুন')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('Service Title', 'সেবার শিরোনাম')}</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('e.g., Math Tutoring', 'যেমন: গণিত শিক্ষা')}
              required
            />
          </div>

          <div>
            <Label>{t('Category', 'ক্যাটাগরি')}</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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
              placeholder={t('Describe your service...', 'আপনার সেবা বর্ণনা করুন...')}
              required
            />
          </div>

          <div>
            <Label>{t('Rate (Unity Notes per hour)', 'রেট (প্রতি ঘণ্টায় Unity Notes)')}</Label>
            <Input
              type="number"
              min="1"
              value={formData.ratePerHour}
              onChange={(e) => setFormData({ ...formData, ratePerHour: parseInt(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label>{t('Availability', 'উপলব্ধতা')}</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {days.map(day => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.value}
                    checked={formData.availability.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <label htmlFor={day.value} className="text-sm cursor-pointer">
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('Cancel', 'বাতিল')}
            </Button>
            <Button type="submit" disabled={!formData.title || !formData.category || !formData.description}>
              {t('Post Service', 'সেবা পোস্ট করুন')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
