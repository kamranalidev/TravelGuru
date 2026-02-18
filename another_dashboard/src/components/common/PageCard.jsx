import { Card as AntCard } from "antd";

const PageCard = ({ children, title, extra, ...props }) => {
  return (
    <AntCard
      title={title}
      extra={extra}
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </AntCard>
  );
};

export default PageCard;
