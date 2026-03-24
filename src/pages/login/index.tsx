import { BankOutlined, LockOutlined, ReloadOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, ConfigProvider, Form, Input, message, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'umi';

const { Title, Text } = Typography;

// ── 粒子动画背景 ───────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; alpha: number;
}


function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const COUNT = Math.min(80, Math.floor((W * H) / 18000));
    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: 1.5 + Math.random() * 2,
      alpha: 0.4 + Math.random() * 0.5,
    }));

    const LINK_DIST = 130;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // update
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const opacity = (1 - dist / LINK_DIST) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(167,139,250,${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,181,253,${p.alpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [canvasRef]);
}

// ── 验证码 canvas ──────────────────────────────────────────────────
function generateCode(length = 4): string {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefghjkmnpqrstwxyz2345678';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function drawCaptchaOnCanvas(canvas: HTMLCanvasElement, code: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // subtle gradient bg
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, '#f3e8ff');
  grad.addColorStop(1, '#ede9fe');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // noise lines
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `hsla(${Math.random() * 360},60%,65%,0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }

  // characters
  code.split('').forEach((char, i) => {
    ctx.font = `bold ${20 + Math.random() * 4}px Arial`;
    ctx.fillStyle = `hsl(${260 + Math.random() * 60},70%,40%)`;
    ctx.save();
    ctx.translate(12 + i * 22, 28);
    ctx.rotate((Math.random() - 0.5) * 0.5);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
}

// ── 主组件 ────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [mfaForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(generateCode);
  const [step, setStep] = useState<'login' | 'mfa'>('login');

  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const captchaCanvasRef = useRef<HTMLCanvasElement>(null);

  useParticleCanvas(bgCanvasRef);

  useEffect(() => {
    if (captchaCanvasRef.current) drawCaptchaOnCanvas(captchaCanvasRef.current, captcha);
  }, [captcha]);

  const refreshCaptcha = () => setCaptcha(generateCode());

  const onLoginFinish = (values: { username: string; password: string; captcha: string; remember: boolean }) => {
    if (values.captcha.toLowerCase() !== captcha.toLowerCase()) {
      message.error('校验码不正确，请重新输入');
      refreshCaptcha();
      form.setFieldValue('captcha', '');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('mfa');
    }, 700);
  };

  const onMfaFinish = (values: { otp: string }) => {
    if (!values.otp || values.otp.length !== 6) {
      message.error('请输入 6 位动态码');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('token', 'mock-token-12345');
      localStorage.setItem('userInfo', JSON.stringify({ name: 'Miya', role: '集团管理员' }));
      message.success('登录成功');
      navigate('/dashboard');
      setLoading(false);
    }, 700);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#0a0618' }}>

      {/* ── 粒子背景 ── */}
      <canvas
        ref={bgCanvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* ── 光晕装饰 ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[
          { top: '-10%', left: '-5%',  size: 500, color: 'rgba(114,46,209,0.18)' },
          { top: '60%',  left: '70%',  size: 400, color: 'rgba(59,130,246,0.14)' },
          { top: '20%',  left: '55%',  size: 350, color: 'rgba(168,85,247,0.12)' },
        ].map((o, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: o.top,
              left: o.left,
              width: o.size,
              height: o.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
          />
        ))}
      </div>

      {/* ── 登录卡片 ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
        }}
      >
        <div
          style={{
            width: 420,
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            padding: '44px 40px 36px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* 顶部 logo 区 */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: 'linear-gradient(135deg, #722ed1 0%, #2f54eb 100%)',
                borderRadius: 14,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 8px 32px rgba(114,46,209,0.45)',
              }}
            >
              <BankOutlined style={{ fontSize: 28, color: '#fff' }} />
            </div>
            <Title level={4} style={{ margin: 0, color: '#fff', letterSpacing: 1 }}>
              集团公司管理系统
            </Title>
            <div style={{ marginTop: 4 }}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 3 }}>
                {step === 'login' ? 'USER LOGIN' : 'MFA VERIFICATION'}
              </Text>
            </div>
          </div>

          {/* ── 登录表单 ── */}
          {step === 'login' ? (
            <ConfigProvider theme={{
              components: {
                Input: {
                  colorBgContainer: 'rgba(255,255,255,0.07)',
                  colorBorder: 'rgba(255,255,255,0.12)',
                  colorText: '#fff',
                  colorTextPlaceholder: 'rgba(255,255,255,0.3)',
                  colorIcon: 'rgba(255,255,255,0.3)',
                  hoverBorderColor: 'rgba(167,139,250,0.6)',
                  activeBorderColor: '#722ed1',
                  colorBgContainerDisabled: 'rgba(255,255,255,0.04)',
                  addonBg: 'rgba(255,255,255,0.05)',
                },
                Checkbox: {
                  colorBgContainer: 'transparent',
                  colorBorder: 'rgba(255,255,255,0.25)',
                  colorText: 'rgba(255,255,255,0.55)',
                },
              },
            }}>
            <Form form={form} onFinish={onLoginFinish} layout="vertical" requiredMark={false}>

              <Form.Item name="username" rules={[{ required: true, message: '请填写用户账号' }]}>
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请填写用户账号"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item name="password" rules={[{ required: true, message: '请填写登录密码' }]}>
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请填写登录密码"
                  size="large"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item name="captcha" rules={[{ required: true, message: '请填写校验码' }]}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Input
                    prefix={<SafetyOutlined />}
                    placeholder="请填写校验码"
                    size="large"
                    style={{ borderRadius: 8, flex: 1 }}
                  />
                  <div
                    style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                    onClick={refreshCaptcha}
                    title="点击刷新验证码"
                  >
                    <canvas
                      ref={captchaCanvasRef}
                      width={100}
                      height={40}
                      style={{ borderRadius: 8, display: 'block' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 3,
                        right: 4,
                        fontSize: 10,
                        color: 'rgba(114,46,209,0.6)',
                        lineHeight: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <ReloadOutlined style={{ fontSize: 9 }} />
                      刷新
                    </div>
                  </div>
                </div>
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 20 }}>
                <Checkbox style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                  记住密码
                </Checkbox>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  style={{
                    height: 46,
                    fontSize: 16,
                    fontWeight: 600,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #722ed1 0%, #2f54eb 100%)',
                    border: 'none',
                    letterSpacing: 4,
                    boxShadow: '0 6px 20px rgba(114,46,209,0.45)',
                  }}
                >
                  登 录
                </Button>
              </Form.Item>
            </Form>
            </ConfigProvider>

          ) : (
            /* ── MFA 表单 ── */
            <Form form={mfaForm} onFinish={onMfaFinish} layout="vertical" requiredMark={false}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
                  请输入您的身份验证器中的 6 位动态码
                </Text>
              </div>

              <Form.Item name="otp" rules={[{ required: true, message: '请输入 6 位动态码' }]}
                style={{ display: 'flex', justifyContent: 'center' }}>
                <Input.OTP
                  length={6}
                  size="large"
                  inputStyle={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 8 }}
                />
              </Form.Item>
              <div style={{ textAlign: 'center', marginTop: -12, marginBottom: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>演示模式：输入任意 6 位数字即可</Text>
              </div>

              <Form.Item style={{ marginTop: 20, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  style={{
                    height: 46,
                    fontSize: 15,
                    fontWeight: 600,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #722ed1 0%, #2f54eb 100%)',
                    border: 'none',
                    boxShadow: '0 6px 20px rgba(114,46,209,0.45)',
                  }}
                >
                  验证并登录
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <Button
                  type="link"
                  size="small"
                  style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}
                  onClick={() => setStep('login')}
                >
                  ← 返回登录
                </Button>
              </div>
            </Form>
          )}

          {/* 底部说明 */}
          <div style={{ textAlign: 'center', marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.28)', fontSize: 12 }}>
              本平台采取邀请制，请联系渠道商
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
