import '@/styles/global.less';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';

export function rootContainer(container: React.ReactNode) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#722ed1',
          colorLink: '#722ed1',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Card: { borderRadiusLG: 8 },
          Table: { borderRadius: 8 },
        },
      }}
    >
      {container}
    </ConfigProvider>
  );
}
