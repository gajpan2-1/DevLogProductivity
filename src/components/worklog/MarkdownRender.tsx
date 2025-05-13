import React from 'react';
import MDEditor from '@uiw/react-markdown-editor';

interface MarkdownRenderProps {
  content: string;
}

const MarkdownRender: React.FC<MarkdownRenderProps> = ({ content }) => {
  return (
    <div className="markdown-render">
      <MDEditor.Markdown source={content} />
    </div>
  );
};

export default MarkdownRender;