import { Zap, ShieldCheck, BarChart3, Heart } from "lucide-react";

const features = [
  { icon: Zap, title: "Super Fast", color: "blue" },
  { icon: ShieldCheck, title: "Privacy First", color: "green" },
  { icon: BarChart3, title: "High Quality", color: "purple" },
  { icon: Heart, title: "Completely Free", color: "pink" },
];

const FeatureFooter = () => (
  <section className="feature-footer" aria-label="WebPify benefits">
    {features.map(({ icon: Icon, title, color }) => (
      <div key={title} className="feature-item">
        <span className={`feature-icon feature-icon-${color}`}>
          <Icon size={17} fill={color === "pink" ? "currentColor" : "none"} />
        </span>
        <span>{title}</span>
      </div>
    ))}
  </section>
);

export default FeatureFooter;
