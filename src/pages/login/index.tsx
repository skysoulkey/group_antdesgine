import { BankOutlined, LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Typography } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'umi';

const { Title, Text } = Typography;

function generateCode(length = 4): string {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefghjkmnpqrstwxyz2345678';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [mfaForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(generateCode());
  const [step, setStep] = useState<'login' | 'mfa'>('login');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawCaptcha();
  }, [captcha]);

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 60%, 70%)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    captcha.split('').forEach((char, i) => {
      ctx.font = `bold ${20 + Math.random() * 6}px Arial`;
      ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 40%)`;
      ctx.save();
      ctx.translate(10 + i * 22, 28);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  };

  const refreshCaptcha = () => setCaptcha(generateCode());

  const onLoginFinish = async (values: { username: string; password: string; captcha: string }) => {
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
    }, 600);
  };

  const onMfaFinish = async (values: { otp: string }) => {
    if (!values.otp || values.otp.length !== 6) {
      message.error('请输入6位动态码');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('token', 'mock-token-12345');
      localStorage.setItem('userInfo', JSON.stringify({ name: 'Miya', role: '集团管理员' }));
      message.success('登录成功');
      navigate('/dashboard');
      setLoading(false);
    }, 600);
  };

  const cardStyle: React.CSSProperties = {
    width: 420,
    background: '#fff',
    borderRadius: 12,
    padding: '48px 40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    position: 'relative',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d1b4b 0%, #1677ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              width: `${120 + i * 80}px`,
              height: `${120 + i * 80}px`,
              top: `${10 + i * 12}%`,
              left: `${5 + i * 8}%`,
            }}
          />
        ))}
      </div>

      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, #1677ff, #0d53d6)',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 8px 24px rgba(22,119,255,0.35)',
            }}
          >
            <BankOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: '#1d2129' }}>
            集团公司管理系统
          </Title>
          <Text type="secondary" style={{ fontSize: 13, letterSpacing: 2 }}>
            {step === 'login' ? 'USER LOGIN' : 'MFA VERIFICATION'}
          </Text>
        </div>

        {step === 'login' ? (
          <Form form={form} onFinish={onLoginFinish} layout="vertical" requiredMark={false}>
            <Form.Item name="username" rules={[{ required: true, message: '请填写用户账号' }]}>
              <Input
                prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请填写用户账号"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: '请填写登录密码' }]}>
              <Input.Password
                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                placeholder="请填写登录密码"
                size="large"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item name="captcha" rules={[{ required: true, message: '请填写校验码' }]}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Input
                  prefix={<SafetyOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="请填写校验码"
                  size="large"
                  style={{ borderRadius: 8, flex: 1 }}
                />
                <canvas
                  ref={canvasRef}
                  width={100}
                  height={40}
                  onClick={refreshCaptcha}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 8,
                    border: '1px solid #d9d9d9',
                    flexShrink: 0,
                  }}
                  title="点击刷新验证码"
                />
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  borderRadius: 8,
                  height: 46,
                  fontSize: 16,
                  background: 'linear-gradient(135deg, #1677ff, #0d53d6)',
                  border: 'none',
                }}
              >
                登 录
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form form={mfaForm} onFinish={onMfaFinish} layout="vertical" requiredMark={false}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Text type="secondary">请输入您的身份验证器中的 6 位动态码</Text>
            </div>

            <Form.Item name="otp" rules={[{ required: true, message: '请输入6位动态码' }]}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Input.OTP length={6} size="large" />
              </div>
            </Form.Item>

            <Form.Item style={{ marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                style={{
                  borderRadius: 8,
                  height: 46,
                  fontSize: 16,
                  background: 'linear-gradient(135deg, #1677ff, #0d53d6)',
                  border: 'none',
                }}
              >
                验证并登录
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Button type="link" size="small" style={{ fontSize: 12, color: '#8c8c8c' }}>
                无法使用验证器？联系管理员
              </Button>
            </div>
          </Form>
        )}

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            本平台采取邀请制，请联系渠道商
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
