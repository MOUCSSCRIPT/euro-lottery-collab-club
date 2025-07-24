import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const countryCodes = [
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+32', country: 'Belgique', flag: '🇧🇪' },
  { code: '+41', country: 'Suisse', flag: '🇨🇭' },
  { code: '+1', country: 'États-Unis', flag: '🇺🇸' },
  { code: '+44', country: 'Royaume-Uni', flag: '🇬🇧' },
  { code: '+49', country: 'Allemagne', flag: '🇩🇪' },
  { code: '+34', country: 'Espagne', flag: '🇪🇸' },
  { code: '+39', country: 'Italie', flag: '🇮🇹' },
];

export const PhoneSignUpForm = () => {
  const [countryCode, setCountryCode] = useState('+33');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { signInWithPhone, verifyOTP } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Format based on country code
    if (countryCode === '+33') {
      // French format: remove leading 0 if present
      return cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    }
    
    return cleanPhone;
  };

  const getFullPhoneNumber = () => {
    const formatted = formatPhoneNumber(phoneNumber);
    return `${countryCode}${formatted}`;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un numéro de téléphone",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhone = getFullPhoneNumber();
      const { error } = await signInWithPhone(fullPhone);
      
      if (error) {
        toast({
          title: "Erreur d'envoi",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setStep('otp');
        setResendTimer(60);
        toast({
          title: "Code envoyé",
          description: `Un code de vérification a été envoyé au ${fullPhone}`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim() || otp.length !== 6) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code à 6 chiffres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fullPhone = getFullPhoneNumber();
      const { error } = await verifyOTP(fullPhone, otp);
      
      if (error) {
        toast({
          title: "Erreur de vérification",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur suerte+ !",
        });
        navigate('/games');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      const fullPhone = getFullPhoneNumber();
      const { error } = await signInWithPhone(fullPhone);
      
      if (error) {
        toast({
          title: "Erreur de renvoi",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setResendTimer(60);
        toast({
          title: "Code renvoyé",
          description: "Un nouveau code a été envoyé",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Entrez le code de vérification envoyé au
          </p>
          <p className="font-medium">{getFullPhoneNumber()}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="otp">Code de vérification</Label>
          <Input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            placeholder="123456"
            maxLength={6}
            className="text-center text-lg tracking-wider"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600"
          disabled={loading || otp.length !== 6}
        >
          {loading ? 'Vérification...' : 'Vérifier le code'}
        </Button>

        <div className="text-center space-y-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep('phone')}
            className="text-sm"
          >
            Modifier le numéro
          </Button>
          
          <div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || loading}
              className="text-sm"
            >
              {resendTimer > 0 
                ? `Renvoyer le code (${resendTimer}s)` 
                : 'Renvoyer le code'
              }
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="country">Pays</Label>
        <Select value={countryCode} onValueChange={setCountryCode}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.country}</span>
                  <span className="text-muted-foreground">({country.code})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Numéro de téléphone</Label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 py-2 border border-input bg-background rounded-md text-sm font-medium min-w-0">
            {countryCode}
          </div>
          <Input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            placeholder={countryCode === '+33' ? '6 12 34 56 78' : '123456789'}
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {countryCode === '+33' 
            ? 'Format: 6 12 34 56 78 (sans le 0)' 
            : 'Entrez votre numéro sans indicatif pays'
          }
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-600"
        disabled={loading}
      >
        {loading ? 'Envoi...' : 'Envoyer le code'}
      </Button>
    </form>
  );
};