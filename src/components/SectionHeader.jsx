// src/components/SectionHeader.jsx

export default function SectionHeader({ title, subtitle, meta }) {
  return (
    <div className="sectionHeader">
      <div className="sectionHeaderLeft">
        <h2 className="sectionTitle">
          <span className="sectionAccent" aria-hidden="true" />
          {title}
        </h2>
        {subtitle ? <p className="sectionSubtitle">{subtitle}</p> : null}
      </div>

      <div className="sectionHeaderRight">
        {meta ? <span className="sectionMeta">{meta}</span> : null}
      </div>
    </div>
  );
}