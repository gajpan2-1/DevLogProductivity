import React from 'react';
import MDEditor from '@uiw/react-markdown-editor';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange }) => {
  return (
    <div className="markdown-editor">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={200}
        preview="edit"
      />
    </div>
  );
};

export default MarkdownEditor;