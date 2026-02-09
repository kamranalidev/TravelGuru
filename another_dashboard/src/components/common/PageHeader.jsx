import { Typography } from "antd";

const { Title: AntTitle } = Typography;

const PageHeader = ({ title, subtitle, extra, style }) => {
  return (
    <div
      style={{
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        ...style,
      }}
    >
      <div>
        <AntTitle level={2} style={{ margin: 0, fontWeight: 600 }}>
          {title}
        </AntTitle>
        {subtitle && (
          <p style={{ margin: "4px 0 0 0", color: "#6B7280", fontSize: 14 }}>
            {subtitle}
          </p>
        )}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
};

export default PageHeader;
