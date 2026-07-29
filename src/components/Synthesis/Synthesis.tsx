import styles from "./Synthesis.module.css";

export default function Synthesis() {
  const pillars = [
    {
      title: "Humanities as OS",
      description: "فلسفه مشخصات (Spec) را ارائه می‌دهد؛ کد پیاده‌سازی (Implementation) است.",
      label: "چرا؟",
    },
    {
      title: "Code as Hermeneutics",
      description: "برنامه‌نویسی = هرمنوتیک مدرن (تفسیر هستیِ دیجیتال).",
      label: "چگونه؟",
    },
    {
      title: "Structure as Freedom",
      description: "محدودیت‌ها (تایپ‌ها، شِماها) عاملیت خلاقانه را ممکن می‌کنند.",
      label: "چیست؟",
    },
  ];

  return (
    <section className={styles.synthesis}>
      <div className={styles.container}>
        <div className={styles.equation}>
          <h2 className={styles.title}>منطق تبلور: از پرسش تا ساخت</h2>

          <div className={styles.equationVisual}>
            <div className={styles.term}>
              <span className={styles.termBox}>[مسئله‌ی انسانی]</span>
              <span className={styles.termSub}>«چرا؟»</span>
            </div>

            <div className={styles.operator}>+</div>

            <div className={styles.term}>
              <span className={styles.termBox}>[راهکار الگوریتمی]</span>
              <span className={styles.termSub}>«چگونه؟»</span>
            </div>

            <div className={styles.operator}>=</div>

            <div className={styles.term}>
              <span className={styles.termBox + " " + styles.result}>[ابزارِ معنادار]</span>
              <span className={styles.termSub}>«چیست؟»</span>
            </div>
          </div>
        </div>

        <div className={styles.pillars}>
          {pillars.map((pillar, i) => (
            <div key={i} className={styles.pillarCard}>
              <span className={styles.pillarLabel}>{pillar.label}</span>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarDesc}>{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
