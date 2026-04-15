import {
  FullscreenExitOutlined, FullscreenOutlined, ReloadOutlined, SettingOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Popover, Space, Typography } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

export interface ColumnDef {
  key: string;
  title: string;
}

interface TableToolbarProps {
  /** 列设置：所有列定义。不传则不显示列设置图标 */
  columns?: ColumnDef[];
  /** 当前可见的列 key 列表 */
  visibleKeys?: string[];
  /** 列可见性变化回调 */
  onVisibleKeysChange?: (keys: string[]) => void;
  /** 刷新回调 */
  onRefresh?: () => void;
  /** 全屏容器 ref */
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const TableToolbar: React.FC<TableToolbarProps> = ({
  columns,
  visibleKeys,
  onVisibleKeysChange,
  onRefresh,
  containerRef,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = () => {
    if (!containerRef?.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const columnSettingsContent = columns && visibleKeys && onVisibleKeysChange ? (
    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text strong style={{ fontSize: 13 }}>列展示</Text>
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => onVisibleKeysChange(columns.map((c) => c.key))}>
          重置
        </Button>
      </div>
      <Checkbox.Group
        value={visibleKeys}
        onChange={(checked) => onVisibleKeysChange(checked as string[])}
        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        {columns.map((col) => (
          <Checkbox key={col.key} value={col.key}>{col.title}</Checkbox>
        ))}
      </Checkbox.Group>
    </div>
  ) : null;

  return (
    <Space size={8}>
      {onRefresh && (
        <ReloadOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} onClick={onRefresh} />
      )}
      {columnSettingsContent ? (
        <Popover content={columnSettingsContent} trigger="click" placement="bottomRight" arrow={false}>
          <SettingOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} />
        </Popover>
      ) : (
        <SettingOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} />
      )}
      {isFullscreen
        ? <FullscreenExitOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} onClick={handleFullscreen} />
        : <FullscreenOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} onClick={handleFullscreen} />
      }
    </Space>
  );
};

export default TableToolbar;
