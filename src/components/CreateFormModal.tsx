import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { feedbackService, CreateFormParams } from '../services/FeedbackService';

const { Option } = Select;

// Feedback type options
const feedbackTypeOptions = [
  { label: 'Rating', value: 'rating' },
  { label: 'Free Text', value: 'free_text' },
  { label: 'Rating & Text', value: 'rating_text' }
];

interface CreateFormModalProps {
  visible: boolean;
  onClose: () => void;
  onFormCreated: () => void;
}

const CreateFormModal: React.FC<CreateFormModalProps> = ({
  visible,
  onClose,
  onFormCreated
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData: CreateFormParams = {
        package_name: values.packageName,
        title: values.title,
        type: values.type
      };

      await feedbackService.createForm(formData);
      message.success('Feedback form created successfully');
      form.resetFields();
      onFormCreated();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to create form: ${error.message}`);
      } else {
        message.error('Failed to create form');
      }
      console.error('Form creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create New Feedback Form"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Create
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="createFeedbackForm"
        style={{ marginBlockStart: '2rem' }}
      >
        <Form.Item
          name="packageName"
          label="Package Name"
          rules={[
              { required: true, message: 'Please enter the package name' }
          ]}
          >
          <Input placeholder="E.g., com.example.myapp" />
        </Form.Item>

        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please enter the form title' },
            { max: 100, message: 'Title cannot exceed 100 characters' }
          ]}
        >
          <Input placeholder="E.g., How would you rate our app?" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Form Type"
          rules={[
            { required: true, message: 'Please select the form type' }
          ]}
        >
          <Select placeholder="Select form type">
            {feedbackTypeOptions.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateFormModal;