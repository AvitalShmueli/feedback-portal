import React, { useEffect } from "react";
import { Form, Select, Input, Space, Button } from "antd";
import { ClearOutlined } from "@ant-design/icons";

const { Option } = Select;

export interface FilterValues {
  package_name?: string;
  title?: string;
  status?: string;
  type?: string;
  is_active?: boolean;
}

interface FiltersProps {
  onFilterChange: (values: FilterValues) => void;
  packageOptions: string[];
  initialValues?: FilterValues;
}

const Filters: React.FC<FiltersProps> = ({
  onFilterChange,
  packageOptions,
  initialValues = {},
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      const formValues = {
        ...initialValues,
        // Convert API is_active back to UI status if needed
        status:
          initialValues.is_active === true
            ? "active"
            : initialValues.is_active === false
            ? "inactive"
            : initialValues.status, // Keep existing status if present
      };
      form.setFieldsValue(formValues);
    }
  }, [form, initialValues]);

  const handleValuesChange = (changedValues: any, allValues: FilterValues) => {
    // Let the parent component (Home) handle localStorage
    onFilterChange(allValues);
  };

  // Add clear filters function
  const handleClearFilters = () => {
    form.resetFields();
    localStorage.removeItem("feedbackFilters");
    onFilterChange({});
  };

  return (
    <Space align="start" size={8}>
      <Form
        form={form}
        layout="inline"
        onValuesChange={handleValuesChange}
        style={{ flexWrap: "wrap", gap: "8px" }}
      >
        <Form.Item name="package_name" label="Package Name">
          <Select
            allowClear
            style={{ width: 200 }}
            placeholder="Select package name"
          >
            {packageOptions.map((pkg) => (
              <Option key={pkg} value={pkg}>
                {pkg}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="title" label="Title">
          <Input placeholder="Search by title" style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="status" label="Status">
          <Select allowClear style={{ width: 120 }} placeholder="Status">
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </Form.Item>

        <Form.Item name="type" label="Type">
          <Select allowClear style={{ width: 150 }} placeholder="Form type">
            <Option value="rating">Rating</Option>
            <Option value="free_text">Free Text</Option>
            <Option value="rating_text">Rating & Text</Option>
          </Select>
        </Form.Item>
      </Form>

      <Form.Item>
        <Button
          icon={<ClearOutlined />}
          onClick={handleClearFilters}
          style={{
            backgroundColor: "rgb(134, 103, 175)",
            borderColor: "rgb(134, 103, 175)",
            color: "white",
          }}
        >
          Clear
        </Button>
      </Form.Item>
    </Space>
  );
};

export default Filters;
