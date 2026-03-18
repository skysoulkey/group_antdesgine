import { Card, Typography } from 'antd';
import { useParams } from 'umi';

const { Title, Text } = Typography;

export default function EnterpriseDetail() {
  const { id } = useParams<{ id: string }>();
  return (
    <Card bordered={false}>
      <Title level={4}>企业详情</Title>
      <Text type="secondary">企业 ID: {id}</Text>
    </Card>
  );
}
