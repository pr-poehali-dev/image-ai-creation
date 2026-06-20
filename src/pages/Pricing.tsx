import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth, api } from '@/context/AuthContext';
import AuthDialog from '@/components/AuthDialog';

interface Plan { slug: string; name: string; price: number; credits: number; features: string[]; is_popular: boolean; }

const Pricing = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState('');

  useEffect(() => { api.plans().then((d) => setPlans(d.plans || [])).catch(() => {}); }, []);

  const subscribe = async (slug: string) => {
    if (!user) { setAuthOpen(true); return; }
    setLoading(slug);
    try {
      const res = await api.subscribe(slug);
      if (user) setUser({ ...user, credits: res.credits, plan: res.plan });
      toast({ title: 'Тариф активирован!', description: `Начислено кредитов. Баланс: ${res.credits}` });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setLoading(''); }
  };

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="font-display font-black text-4xl mb-3">Тарифы</h1>
        <p className="text-muted-foreground">Выбери план под свой объём творчества</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.slug} className={`glass relative overflow-hidden ${plan.is_popular ? 'border-primary glow' : 'border-white/10'}`}>
            {plan.is_popular && (
              <div className="absolute top-0 right-0 gradient-bg text-white text-xs font-semibold px-4 py-1 rounded-bl-xl">Популярный</div>
            )}
            <CardContent className="p-7">
              <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-display font-black text-4xl">{plan.price === 0 ? 'Бесплатно' : `${plan.price}₽`}</span>
                {plan.price > 0 && <span className="text-muted-foreground text-sm mb-1.5">/мес</span>}
              </div>
              <Badge variant="outline" className="border-accent/40 text-accent mb-5 gap-1">
                <Icon name="Zap" size={12} /> {plan.credits} кредитов
              </Badge>
              <ul className="space-y-3 mb-7">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Icon name="Check" size={16} className="text-accent mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Button onClick={() => subscribe(plan.slug)} disabled={loading === plan.slug}
                className={`w-full ${plan.is_popular ? 'gradient-bg text-white border-0 glow-hover' : ''}`}
                variant={plan.is_popular ? 'default' : 'outline'}>
                {loading === plan.slug ? <Icon name="Loader2" size={16} className="animate-spin" /> :
                  user?.plan === plan.slug ? 'Текущий тариф' : plan.price === 0 ? 'Начать бесплатно' : 'Подключить'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Pricing;
