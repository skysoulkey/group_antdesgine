import React from 'react';

/**
 * FilterField — 筛选区字段前缀组件
 *
 * 【适用】筛选区 / 搜索区控件前的字段名前缀（design-spec 9.0）
 *
 * 【用法】
 *   <FilterField label="订单类型">
 *     <Radio.Group>...</Radio.Group>
 *   </FilterField>
 *
 *   <FilterField label="创建时间">
 *     <DatePicker.RangePicker placeholder={['从', '到']} />
 *   </FilterField>
 *
 * 【视觉】Ant Design 文本次色 rgba(0,0,0,0.65)，14px，中文冒号「：」，紧贴控件
 */
export interface FilterFieldProps {
  /** 字段名（必填，不允许空） */
  label: string;
  /** 控件本身 */
  children: React.ReactNode;
  /** 整体内联块样式覆盖（按需） */
  style?: React.CSSProperties;
}

export const FilterField: React.FC<FilterFieldProps> = ({ label, children, style }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
    <span style={{ color: 'rgba(0,0,0,0.65)', fontSize: 14, marginRight: 4, whiteSpace: 'nowrap' }}>
      {label}：
    </span>
    {children}
  </span>
);

export default FilterField;
