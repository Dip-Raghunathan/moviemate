import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../../shared/components/Navbar';
import { useAuth } from '../../../core/contexts/AuthContext';
import { useToast } from '../../../core/contexts/ToastContext';
import * as billingService from '../../../services/billingService';
import * as authService from '../../../services/authService';
import Badge from '../../../shared/components/ui/Badge';
import Spinner from '../../../shared/components/ui/Spinner';
import { PremiumIcon } from '../../../shared/components/icons/IconComponents';

const BENEFITS = [
  { icon: 'star', title: 'Unlimited Matches', desc: 'Join and create as many solo or group rooms as you wish.' },
  { icon: 'diamond', title: 'Premium Avatar Ring', desc: 'Stand out in chat rooms with an animated red-gold gradient avatar border.' },
  { icon: 'crown', title: 'Verified Badge', desc: 'Display a verified badge on your profile and messages for trust.' },
  { icon: 'rocket', title: 'Priority Matching Queue', desc: 'Your match requests are processed first with high compatibility companions.' },
  { icon: 'popcorn', title: 'Exclusive Event Hosting', desc: 'Host custom Watch Parties and invite friends/communities.' },
];

const UpgradePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState({ subscription: null, payments: [] });
  const [plan, setPlan] = useState('monthly');
  const [scenario, setScenario] = useState('success');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [webhookPending, setWebhookPending] = useState(false);

  const fetchSubscriptionDetails = async () => {
    try {
      const data = await billingService.getSubscription();
      setSubData(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    setWebhookPending(false);
    try {
      // 1. Create Mock Checkout Session
      const sessionData = await billingService.createCheckoutSession(plan, scenario);
      const { sessionId, amount, transactionId, invoiceNumber } = sessionData.data;

      toast.info('Simulating Stripe Checkout redirection...', 'Stripe Gateway');

      // Simulate a small transition redirecting delay (e.g. 1.2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 2. Trigger Mock Stripe Webhook
      toast.info('Simulating Stripe payment processing...', 'Stripe webhook');
      const webhookPayload = {
        userId: user.id,
        plan,
        amount,
        transactionId,
        invoiceNumber,
        scenario,
      };

      const eventId = 'evt_' + Math.random().toString(36).slice(2, 10);
      const webhookResult = await billingService.triggerMockWebhook(eventId, webhookPayload);

      if (scenario === 'webhook_delay') {
        setWebhookPending(true);
        toast.warning('Payment authorized. Webhook processing is delayed on the server...', 'Stripe Pending');
        // Poll for changes
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const data = await billingService.getSubscription();
          if (data.subscription?.status === 'active' || attempts >= 5) {
            clearInterval(interval);
            setWebhookPending(false);
            if (data.subscription?.status === 'active') {
              setSubData(data);
              const meData = await authService.getMe();
              updateUser(meData.data.user);
              toast.success('Stripe webhook completed! upgraded to PRO tier', 'PRO Unlocked');
            } else {
              toast.error('Webhook processing timed out. Please refresh.', 'Stripe Timeout');
            }
          }
        }, 1500);
      } else if (scenario === 'failure') {
        toast.error('Simulated Stripe card rejection: Payment failed.', 'Payment Rejected');
        await fetchSubscriptionDetails();
      } else {
        toast.success('Payment succeeded! upgraded to PhilixMate Pro.', 'Welcome to Pro');
        // Update local auth context
        const meData = await authService.getMe();
        updateUser(meData.data.user);
        await fetchSubscriptionDetails();
      }
    } catch (err) {
      console.error(err);
      if (scenario === 'timeout') {
        toast.error('Checkout failed: Stripe server timeout (exceeded 10s timeout limit). Retrying connection...', 'Server Timeout');
      } else {
        toast.error(err.response?.data?.message || 'Payment simulation failed. Please try again.');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your PhilixMate Pro subscription? You will lose access to all premium features.')) {
      return;
    }
    setCanceling(true);
    try {
      await billingService.cancelSubscription();
      toast.success('Your subscription has been canceled successfully.');
      
      const meData = await authService.getMe();
      updateUser(meData.data.user);
      await fetchSubscriptionDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel subscription.');
    } finally {
      setCanceling(false);
    }
  };

  const isPro = subData.subscription?.status === 'active';

  return (
    <div style={{ background: '#05050a', minHeight: '100vh', color: '#f0f0fa' }}>
      <Navbar />

      {/* Ambient background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }} aria-hidden="true">
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 850,
          height: 450,
          background: 'radial-gradient(ellipse, rgba(245,166,35,0.06) 0%, rgba(232,16,42,0.04) 40%, transparent 70%)',
          filter: 'blur(90px)'
        }} />
      </div>

      <div className="section-container" style={{ paddingTop: 96, paddingBottom: 64, position: 'relative', zIndex: 1 }}>
        
        {/* Back Link */}
        <Link
          to="/profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#6b6b85',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: 24,
            transition: 'color 200ms ease',
            fontWeight: 500
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#f0f0fa'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b6b85'}
        >
          ← Back to Profile
        </Link>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
            <Spinner size="lg" color="#f5a623" />
            <p style={{ color: '#6b6b85', fontSize: '0.9rem' }}>Loading billing dashboard...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, alignItems: 'start' }}>
            
            {/* ── Left Side: Billing Plan Options / Active Membership ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {isPro ? (
                // Active Premium Card
                <div style={{
                  background: 'linear-gradient(135deg, rgba(245,166,35,0.08) 0%, rgba(14,14,28,0.98) 50%, rgba(232,16,42,0.06) 100%)',
                  border: '1px solid rgba(245,166,35,0.3)',
                  borderRadius: 24,
                  padding: '32px 28px',
                  boxShadow: '0 8px 32px rgba(245,166,35,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <Badge variant="pro" style={{ fontSize: '0.8rem', padding: '4px 10px', marginBottom: 12 }} />
                      <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.75rem', color: '#f0f0fa', margin: 0 }}>
                        PhilixMate Pro
                      </h2>
                    </div>
                    <PremiumIcon name="star" size={40} color="#f5a623" />
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#a8a8c0', lineHeight: 1.6, marginBottom: 24 }}>
                    Your subscription is currently <span style={{ color: '#34d399', fontWeight: 700 }}>Active</span>. You have full access to all cinematic features.
                  </p>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.8125rem' }}>
                      <span style={{ color: '#6b6b85' }}>Billing Cycle</span>
                      <span style={{ color: '#f0f0fa', fontWeight: 600, textTransform: 'capitalize' }}>{subData.subscription?.plan}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: '#6b6b85' }}>Next Renewal Date</span>
                      <span style={{ color: '#f0f0fa', fontWeight: 600 }}>
                        {new Date(subData.subscription?.expiresAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCancel}
                    disabled={canceling}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 12,
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 200ms ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                  >
                    {canceling ? <Spinner size="sm" color="#f87171" /> : 'Cancel Subscription'}
                  </button>
                </div>
              ) : (
                // Subscription purchase card
                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 24,
                  padding: '32px 28px',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.4)'
                }}>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f0f0fa', margin: '0 0 8px 0' }}>
                    Choose Your Plan
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: '#6b6b85', margin: '0 0 24px 0' }}>
                    Unlock verified badges, companion matches, and elite status.
                  </p>

                  {/* Plan toggler */}
                  <div style={{
                    display: 'flex',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14,
                    padding: 4,
                    marginBottom: 24
                  }}>
                    {['monthly', 'yearly'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPlan(p)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: 10,
                          border: 'none',
                          cursor: 'pointer',
                          background: plan === p ? 'linear-gradient(135deg,#f5a623,#e8102a)' : 'transparent',
                          color: plan === p ? 'white' : '#6b6b85',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          transition: 'all 200ms ease',
                          textTransform: 'capitalize'
                        }}
                      >
                        {p} Plan {p === 'yearly' && '(-15%)'}
                      </button>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: '#f0f0fa' }}>
                      {plan === 'monthly' ? '$9.99' : '$99.99'}
                      <span style={{ fontSize: '1rem', color: '#6b6b85', fontWeight: 500 }}>
                        /{plan === 'monthly' ? 'month' : 'year'}
                      </span>
                    </p>
                  </div>

                  {/* Scenario selection list */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b6b85', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                      Stripe Simulation Scenario
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { val: 'success', label: 'Success (Instant)', desc: 'Processes payment and upgrades tier.' },
                        { val: 'webhook_delay', label: 'Webhook Delay', desc: 'Simulates webhook delay, checking statuses.' },
                        { val: 'failure', label: 'Declined Card', desc: 'Simulates card rejection.' },
                        { val: 'timeout', label: 'Server Timeout', desc: 'Simulates Stripe network failure.' }
                      ].map((item) => (
                        <div
                          key={item.val}
                          onClick={() => setScenario(item.val)}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 12,
                            background: scenario === item.val ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${scenario === item.val ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.05)'}`,
                            cursor: 'pointer',
                            transition: 'all 200ms ease'
                          }}
                        >
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f0f0fa', marginBottom: 2 }}>{item.label}</div>
                          <div style={{ fontSize: '0.7rem', color: '#6b6b85' }}>{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleUpgrade}
                    disabled={checkoutLoading || webhookPending}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 14,
                      background: 'linear-gradient(135deg, #f5a623 0%, #e8102a 100%)',
                      border: 'none',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(232,16,42,0.3)',
                      transition: 'all 200ms ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(232,16,42,0.45)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,16,42,0.3)';
                    }}
                  >
                    {checkoutLoading || webhookPending ? (
                      <>
                        <Spinner size="sm" color="white" />
                        {webhookPending ? 'Waiting for Webhook...' : 'Redirection to Stripe...'}
                      </>
                    ) : (
                      'Upgrade to Pro'
                    )}
                  </button>
                </div>
              )}

              {/* Ledger Payments History */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 24,
                padding: '24px'
              }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f0f0fa', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <PremiumIcon name="calendar" size={18} color="#a8a8c0" /> Ledger Payments History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 180, overflowY: 'auto' }}>
                  {subData.payments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#6b6b85', padding: '16px 0', fontSize: '0.8125rem' }}>
                      No payment receipts generated yet.
                    </div>
                  ) : (
                    subData.payments.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          fontSize: '0.75rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#f0f0fa' }}>{p.invoiceNumber}</div>
                          <div style={{ color: '#6b6b85', fontSize: '0.6875rem', marginTop: 2 }}>
                            {new Date(p.date).toLocaleDateString()} • {p.transactionId}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#f0f0fa', marginBottom: 2 }}>${p.amount}</div>
                          <span style={{
                            padding: '1px 6px',
                            borderRadius: 4,
                            fontSize: '9px',
                            fontWeight: 800,
                            color: p.status === 'succeeded' ? '#34d399' : p.status === 'failed' ? '#f87171' : '#fbbf24',
                            background: p.status === 'succeeded' ? 'rgba(52,211,153,0.1)' : p.status === 'failed' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)'
                          }}>
                            {p.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ── Right Side: Premium Benefits description list ── */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 24,
              padding: '32px 28px'
            }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: '#f5a623', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <PremiumIcon name="star" size={32} color="#f5a623" />
                Why PhilixMate Pro?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {BENEFITS.map((b) => (
                  <div key={b.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <PremiumIcon name={b.icon} size={24} color="#f5a623" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f0f0fa', margin: '0 0 4px 0' }}>{b.title}</h4>
                      <p style={{ fontSize: '0.8125rem', color: '#6b6b85', lineHeight: 1.4, margin: 0 }}>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradePage;
