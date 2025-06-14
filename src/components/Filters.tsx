import React, { useState, useEffect, useCallback } from 'react';
import { Select, Input, Space, Typography, Form } from 'antd';
import { debounce } from 'lodash';

const { Option } = Select;
const { Text } = Typography;

const feedbackTypeOptions = [
  { label: 'Rating', value: 'rating' },
  { label: 'Free Text', value: 'free_text' },
  { label: 'Rating & Text', value: 'rating_text' }
];

export interface FilterValues {
  packageName?: string;
  status?: string;
  searchQuery?: string;
  feedbackType?: string;
}

interface FiltersProps {
  onFilterChange?: (filters: FilterValues) => void;
  packageOptions?: string[];
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange, packageOptions = [] }) => {
  const [filters, setFilters] = useState<FilterValues>({
    packageName: undefined,
    status: undefined,
    searchQuery: '',
    feedbackType: undefined,
  });
  
  // Create a debounced function that will be stable between renders
  const debouncedOnFilterChange = useCallback(
    debounce((newFilters: FilterValues) => {
      if (onFilterChange) {
        onFilterChange(newFilters);
      }
    }, 1000), 
    [onFilterChange]
  );

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    
    // Use debounced version only for search query
    if (key === 'searchQuery') {
      debouncedOnFilterChange(updatedFilters);
    } else {
      // For other filters, apply immediately
      if (onFilterChange) {
        onFilterChange(updatedFilters);
      }
    }
  };

  // Clean up the debounce on unmount
  useEffect(() => {
    return () => {
      debouncedOnFilterChange.cancel();
    };
  }, [debouncedOnFilterChange]);

  const handleSearch = (value: string) => {
    handleFilterChange('searchQuery', value);
  };

  return (
    <Form layout="inline" style={{ marginBottom: 24 }}>
      <Space direction="horizontal" size="middle" align="center" wrap style={{ width: '100%' }}>
        <Text strong>Filter by:</Text>

        <Select 
            placeholder="Select package" 
            style={{ minWidth: 300 }} 
            allowClear
            onChange={(value) => handleFilterChange('packageName', value)}
            value={filters.packageName}
            >
            {packageOptions.map((pkg) => (
                <Option key={pkg} value={pkg}>
                {pkg}
                </Option>
            ))}
        </Select>

        <Select 
          placeholder="Select status" 
          style={{ minWidth: 160 }}
          allowClear
          onChange={(value) => handleFilterChange('status', value)}
          value={filters.status}
        >
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>

        <Select 
          placeholder="Select feedback type" 
          style={{ minWidth: 180 }}
          allowClear
          onChange={(value) => handleFilterChange('feedbackType', value)}
          value={filters.feedbackType}
        >
          {feedbackTypeOptions.map((type) => (
            <Option key={type.value} value={type.value}>
              {type.label}
            </Option>
          ))}
        </Select>
        
        <Input.Search
          placeholder="Search by title"
          allowClear
          style={{ minWidth: 240 }}
          onSearch={handleSearch}
          onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          value={filters.searchQuery}
        />

      </Space>
    </Form>
  );
};

export default Filters;