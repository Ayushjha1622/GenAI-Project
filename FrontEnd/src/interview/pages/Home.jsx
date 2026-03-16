import "../style/Home.scss";

const Home = () => {
  return (
    <main className="home-page">
      <section className="home-shell">
        <div className="hero-head">
          <div>
            <h1>Create Your Custom Interview Plan</h1>
            <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="card left-card">
            <div className="card-line">
              <div className="section-left">
                <span className="icon">📌</span>
                <div>
                  <p className="section-title">Target Job Description</p>
                </div>
              </div>
              <span className="pill required">Required</span>
            </div>

            <textarea
              id="jobDescription"
              placeholder="Paste the full job description here...\ne.g. Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."
            />
            <div className="char-row">0 / 5000 chars</div>
          </div>

          <div className="card right-card">
            <div className="card-line">
              <div className="section-left">
                <span className="icon">👤</span>
                <div>
                  <p className="section-title">Your Profile</p>
                </div>
              </div>
              <span className="pill best">Best Results</span>
            </div>

            <div className="upload-box">
              <div className="upload-inner">
                <div className="cloud">⬆</div>
                <p className="upload-title">Click to upload or drag & drop</p>
                <p className="upload-sub">PDF or DOCX (Max 5MB)</p>
              </div>
              <label htmlFor="resume" className="upload-btn">Upload Resume</label>
              <input id="resume" type="file" hidden accept=".pdf,.doc,.docx" />
            </div>

            <div className="or-divider"><span>OR</span></div>

            <p className="label">Quick Self-Description</p>
            <textarea
              id="selfDescription"
              className="mini-textarea"
              placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
            />

            <div className="info-box">Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</div>

            <button className="cta-btn">★ Generate My Interview Strategy</button>
          </div>
        </div>

        <div className="footer-row">
          AI-Powered Strategy Generation · Approx 30s
        </div>
      </section>
    </main>
  );
};

export default Home;
