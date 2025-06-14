import React, { useState, useEffect } from 'react';
import { Typography, Card, Layout, Table, Spin, Empty, Button, Space, Rate, Row, Col, Statistic, Switch, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import type { TableProps } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { feedbackService, FeedbackEntry, FeedbackStatistics } from '../services/FeedbackService';


const { Title, Text } = Typography;
const { Content } = Layout;

const FeedbackEntries: React.FC = () => {
  const { packageName, formId } = useParams<{ packageName: string, formId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [statistics, setStatistics] = useState<FeedbackStatistics>({
    average_rating: 0,
    rating_breakdown: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    total_feedback: 0
  });

  const formState = location.state as { 
    formTitle?: string; 
    formType?: string;
    isActive?: boolean;
  } | undefined;

  const [isFormActive, setIsFormActive] = useState<boolean>(formState?.isActive !== false);

  const handleActiveToggle = async (checked: boolean) => {
  if (!formId) return;
  
  try {
    setIsFormActive(checked); // Optimistically update UI
    await feedbackService.updateFormStatus(formId, checked);
    message.success(`Form ${checked ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error('Error updating form status:', error);
    setIsFormActive(!checked); // Revert UI on error
    message.error('Failed to update form status');
  }
};
  const formTitle = formState?.formTitle || 'Feedback Form';
  const showStats = formState?.formType !== "free_text";
  const isActive = formState?.isActive !== false;

  const formatDate =(dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!packageName || !formId) {
        return;
      }
      
      setLoading(true);
      try {
        const entries = await feedbackService.getFeedbackEntries(packageName, formId);
        setFeedbackEntries(entries);
        
      } catch (error) {
        console.error('Error fetching feedback entries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [packageName, formId]);

  const goBack = () => {
    navigate('/');
  };
  
  useEffect(() => {
    const fetchData = async () => {
      if (!packageName || !formId) {
        return;
      }
      
      setLoading(true);
      try {
        // Fetch feedback entries
        const entries = await feedbackService.getFeedbackEntries(packageName, formId);
        setFeedbackEntries(entries);
        
        // Fetch statistics
        const stats = await feedbackService.getFeedbackStatistics(packageName, formId);
        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [packageName, formId]);

  const chartData = Object.entries(statistics.rating_breakdown).map(([rating, count]) => ({
    rating: Number(rating),
    count,
    color: ['#f5222d', '#fa8c16', '#faad14', '#52c41a', '#1890ff'][Number(rating) - 1]
  }));

  const columns: TableProps<FeedbackEntry>['columns'] = [
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 160,
      render: (rating) => rating ? <Rate disabled defaultValue={rating} /> : <Text type="secondary">No rating</Text>,
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      width: 250,
      render: (message) => message || <Text type="secondary">No message</Text>,
      ellipsis: true,
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => formatDate(date),
      sorter: (a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; 
      },
      defaultSortOrder: 'ascend' 
    },
    {
      title: 'App Version',
      dataIndex: 'app_version',
      key: 'app_version',
      width: 120,
      render: (version) => version || <Text type="secondary">Unknown</Text>,
    },
    {
      title: 'Device',
      dataIndex: 'device_info',
      key: 'device_info',
      width: 180,
      render: (device_info) => device_info || <Text type="secondary">Unknown</Text>,
    },
    {
      title: 'User',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120,
      render: (userId) => userId || <Text type="secondary">Anonymous</Text>,
      ellipsis: true,
    },
  ];

  return (
    <Layout style={{ padding: '24px', background: '#f9f0ff' }}>
      <Content>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={goBack}
            >
              Back to Forms
            </Button>
          </Space>
          
          <Space direction="horizontal" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>{formTitle}</Title>
            <Space>
              <Text strong>Status:</Text>
              <Switch 
                checked={isFormActive} 
                onChange={handleActiveToggle} 
                checkedChildren="Active" 
                unCheckedChildren="Inactive"
              />
            </Space>
          </Space>          
          {showStats ? 
          <Card>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div style={{height : 200}}>
                  <Card>
                    <Statistic 
                      title="Total Responses" 
                      value={statistics.total_feedback}
                      />
                  </Card>

                  <Card style={{ marginTop: 32 }}>
                    <Statistic 
                      title="Average Rating" 
                      value={statistics.average_rating.toFixed(1)} 
                      suffix={
                        <Rate 
                        disabled 
                        allowHalf 
                        defaultValue={statistics.average_rating} 
                        style={{ fontSize: '16px', marginLeft: '8px' }} 
                        />
                      } 
                      />
                  </Card>
                  </div>
                </Col>
              <Col xs={24} md={12}>
                <Card bordered={false}>
                  <Title level={5}>Rating Distribution</Title>
                  <div style={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 5, right: 20, left: 0, bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} responses`, 'Count']} />
                        <Bar dataKey="count" name="Responses">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card> : 
          <Card>
            <Card>
              <Statistic 
                title="Total Responses" 
                value={statistics.total_feedback}
                />
            </Card>
          </Card>
          }

          {/* Feedback Entries Table */}
          <Card>
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <Table 
                  columns={columns}
                  dataSource={feedbackEntries}
                  rowKey="_id"
                  pagination={{ pageSize: 8, position: ['bottomCenter'] }}
                  locale={{ emptyText: <Empty description="No feedback entries found" /> }}
                  scroll={{ x: 'max-content' }}
                />
              )}
            </div>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
};

export default FeedbackEntries;