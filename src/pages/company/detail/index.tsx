import { Card, Typography } from 'antd';
import { useParams } from 'umi';

const { Title, Text } = Typography;

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <Card bordered={false}>
      <Title level={4}>公司详情</Title>
      <Text type="secondary">公司 ID: {id}</Text>
    </Card>
  );
}
