import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Layout, Table, Spin, Empty, Tag, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import CreateFormModal from '../components/CreateFormModal';
import type { TableProps } from 'antd';
import Filters, { FilterValues } from '../components/Filters';
import { feedbackService, FeedbackItem } from '../services/FeedbackService';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { debounce } from 'lodash';

const { Title, Text } = Typography;
const { Content, Footer } = Layout;

// Create a styled Footer component with purple accent
const StyledFooter = styled(Footer)`
  background: #f9f0ff;
  text-align: center;
`;

const StyledHeader = styled.div`
  background-color:rgb(134, 103, 175);
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const HeaderTitle = styled(Title)`
  color: white !important;
  margin-bottom: 0 !important;
`;

const PurpleTitle = styled(Text)`
  color: #722ed1;
  font-weight: bold;
`;

const Home: React.FC = () => {
  const [filters, setFilters] = useState<FilterValues>({});
  const [packages, setPackages] = useState<string[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialLoad = React.useRef(true);

  const uiFilters = React.useMemo(() => {
    return {
      package_name: filters.package_name,
      title: filters.title,
      type: filters.type,
      status: filters.is_active === true ? 'active' : 
              filters.is_active === false ? 'inactive' : undefined
    };
  }, [filters]);
  

    const fetchFeedbackItems = useCallback(async (filterValues = filters) => {
    setLoading(true);
    try {
      const items = await feedbackService.searchFeedback(filterValues);
      setFeedbackItems(items);
    } catch (error) {
      console.error('Error fetching feedback items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

const handleFilterChange = useCallback((values: FilterValues) => {
  // Convert status from string to boolean for the API
  const apiValues = {
    ...values,
    is_active: values.status === 'active' ? true : 
              values.status === 'inactive' ? false : undefined
  };
  
  // Save the raw values for UI persistence
  localStorage.setItem('feedbackFilters', JSON.stringify(values));
  
  // Set filters WITHOUT triggering a useEffect
  setFilters(apiValues);
  
  // Directly fetch data with the new filters
  fetchFeedbackItems(apiValues);
}, [fetchFeedbackItems]);

// Update debouncedFilterChange similarly
const debouncedFilterChange = useCallback(
  debounce((values: FilterValues) => {
    // Convert status from string to boolean for the API
    const apiValues = {
      ...values,
      is_active: values.status === 'active' ? true : 
                values.status === 'inactive' ? false : undefined
    };
    
    // Save the raw values for UI persistence
    localStorage.setItem('feedbackFilters', JSON.stringify(values));
    
    // Set filters WITHOUT triggering a useEffect
    setFilters(apiValues);
    
    // Directly fetch data with the new filters
    fetchFeedbackItems(apiValues);
  }, 300),
  [fetchFeedbackItems]
);


useEffect(() => {
  const shouldReloadFilters = location.state && (location.state as any).reloadFilters;
  
  if (shouldReloadFilters) {
    const savedFilters = localStorage.getItem('feedbackFilters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        
        // Convert status values for API
        const apiFilters = {
          ...parsedFilters,
          is_active: parsedFilters.status === 'active' ? true : 
                    parsedFilters.status === 'inactive' ? false : undefined
        };
        
        setFilters(apiFilters);
      } catch (e) {
        console.error('Error parsing saved filters:', e);
        localStorage.removeItem('feedbackFilters');
      }
    }
    
    // Clear the flag from location state 
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [location.state, navigate, location.pathname]);



  const handleRowClick = (record: FeedbackItem) => {
    if (record._id && record.package_name) {
      navigate(`/feedback/${record.package_name}/${record._id}`, {
        state: { 
          formTitle: record.title,
          formType: record.type,
          isActive: record.is_active
        }
      });
    }
  };

  const showCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleCreateModalClose = () => {
    setIsCreateModalVisible(false);
  };

const handleFormCreated = () => {
  // Refetch with current filters
  fetchFeedbackItems(filters);
};
useEffect(() => {
  const initializeData = async () => {
    setLoading(true);
    
    try {
      // First load packages (needed for dropdown)
      const packagesData = await feedbackService.getAllPackages();
      setPackages(packagesData);
      
      // Check for saved filters
      const savedFilters = localStorage.getItem('feedbackFilters');
      let filtersToApply = {};
      
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          
          // Convert status values for API
          const apiFilters = {
            ...parsedFilters,
            is_active: parsedFilters.status === 'active' ? true : 
                      parsedFilters.status === 'inactive' ? false : undefined
          };
          
          filtersToApply = apiFilters;
          // Set filters state silently (without triggering another fetch)
          setFilters(filtersToApply);
        } catch (e) {
          console.error('Error parsing saved filters:', e);
          localStorage.removeItem('feedbackFilters');
        }
      }
      
      // Fetch data directly
      await fetchFeedbackItems(filtersToApply);
      
    } catch (error) {
      console.error('Error initializing data:', error);
      setLoading(false);
    }
    
    isInitialLoad.current = false;
  };
  
  initializeData();
}, [fetchFeedbackItems]);


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

  const columns: TableProps<FeedbackItem>['columns'] = [
    {
      title: 'Package Name',
      dataIndex: 'package_name',
      key: 'package_name',
      ellipsis: true,
      sorter: (a, b) => (a.package_name || '').localeCompare(b.package_name || ''),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive) => {
        const status = isActive ? "active" : "inactive";
        const color = isActive ? 'green' : 'red';
        
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type) => {
        let typeText = type || 'unknown';
        let color = 'blue';
        
        if (type === 'rating') color = 'purple';
        if (type === 'free_text') color = 'cyan';
        if (type === 'ratingtext') color = 'geekblue';
        
        return <Tag color={color}>{typeText.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Rating', value: 'rating' },
        { text: 'Free Text', value: 'free_text' },
        { text: 'Rating & Text', value: 'rating_text' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (date) => formatDate(date),
      sorter: (a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA; 
      },
      defaultSortOrder: 'ascend' 
    }
  ];

  return (
    <>
      <StyledHeader>
        <HeaderTitle level={2}>Feedback Portal</HeaderTitle>
      </StyledHeader>
      <Layout style={{ padding: '24px', display: 'flex', flexDirection: 'column', background: '#f9f0ff' }}>
        <Content style={{ flex: '1 0 auto' }}>
          <Card>
            <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
              <Filters 
                onFilterChange={debouncedFilterChange}
                packageOptions={packages}
                initialValues={uiFilters}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
                Create Form
              </Button>
            </Space>
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <Table 
                  columns={columns}
                  dataSource={feedbackItems}
                  rowKey="_id"
                  pagination={{ pageSize: 7 }}
                  locale={{ emptyText: <Empty description="No feedback items found" /> }}
                  scroll={{ x: 'max-content' }}
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: 'pointer' }
                  })}
                />
              )}
            </div>
          </Card>
          
          <CreateFormModal
            visible={isCreateModalVisible}
            onClose={handleCreateModalClose}
            onFormCreated={handleFormCreated}
          />
        </Content>

        <StyledFooter>
            <Text type="secondary">© {new Date().getFullYear()} Avital Shmueli. All rights reserved.</Text>
        </StyledFooter>
      </Layout>
    </>
  );
};

export default Home;