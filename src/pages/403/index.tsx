import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'umi';
import { defaultRoute, MOCK_ROLE } from '../../utils/auth';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
        extra={
          <Button type="primary" onClick={() => navigate(defaultRoute(MOCK_ROLE))}>
            返回首页
          </Button>
        }
      />
    </div>
  );
};

export default ForbiddenPage;
