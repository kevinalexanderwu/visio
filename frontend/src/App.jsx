import { useEffect, useState } from 'react';
import VisionCanvas from './components/VisionCanvas.jsx';

const initial = { minus: 0, plus: 0, cylinder: 0 };
const format = (n) => `${n > 0 ? '+' : ''}${Number(n).toFixed(2)} D`;

function Control({ label, abbreviation, value, min, max, onChange }) {
  return (
    <div className="control-row">
      <label className="control-label">
        <span>{label}</span>
        <small>{abbreviation}</small>
      </label>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step="0.25"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>{format(value)}</output>
    </div>
  );
}

export default function App() {
  const [values, setValues] = useState(initial);
  const [history, setHistory] = useState([]);
  const [notice, setNotice] = useState('');

  async function loadHistory() {
    try {
      const response = await fetch('/api/simulations');
      if (response.ok) setHistory(await response.json());
    } catch {
      // The simulator remains usable when the API is unavailable in frontend-only development.
    }
  }

  useEffect(() => { loadHistory(); }, []);

  const update = (key, value) => setValues((current) => {
    if (key === 'minus' && value < 0) return { ...current, minus: value, plus: 0 };
    if (key === 'plus' && value > 0) return { ...current, plus: value, minus: 0 };
    return { ...current, [key]: value };
  });

  async function save() {
    setNotice('');
    try {
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save simulation');
      setNotice('Simulation saved.');
      loadHistory();
    } catch (error) {
      setNotice(error.message || 'Could not connect to the API.');
    }
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="Visio home">visio.</a>
        <span className="header-caption">VISION SIMULATOR</span>
      </header>

      <section className="intro">
        <h1>How do you see the world?</h1>
        <p>Adjust a few prescription values and explore a simplified view of how vision can change.</p>
      </section>

      <section className="simulator" aria-label="Vision simulator">
        <div className="preview-heading">
          <span>Live preview</span>
          <span className="live-indicator"><i /> Updating as you adjust</span>
        </div>
        <VisionCanvas values={values} />
        <p className="image-caption">A depth-aware educational simulation. Not a clinical optical model.</p>

        <div className="controls-heading">
          <h2>Prescription</h2>
          <button className="reset-button" type="button" onClick={() => setValues(initial)}>Reset</button>
        </div>
        <div className="controls">
          <Control label="Sphere Minus" abbreviation="SPH" value={values.minus} min={-10} max={0} onChange={(value) => update('minus', value)} />
          <Control label="Sphere Plus" abbreviation="SPH" value={values.plus} min={0} max={10} onChange={(value) => update('plus', value)} />
          <Control label="Cylinder" abbreviation="CYL" value={values.cylinder} min={-6} max={0} onChange={(value) => update('cylinder', value)} />
        </div>

        <div className="save-row">
          <button className="save-button" type="button" onClick={save}>Save simulation</button>
          {notice && <p className="notice" role="status">{notice}</p>}
        </div>
      </section>

      <section className="history" aria-labelledby="history-title">
        <div className="history-heading">
          <h2 id="history-title">Simulation history</h2>
          <span>{history.length} saved</span>
        </div>
        {history.length ? (
          <ul className="history-list">
            {history.map((item) => (
              <li className="history-item" key={item.id}>
                <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
                <span className="history-values">
                  <span>SPH− {format(Number(item.minus))}</span>
                  <span>SPH+ {format(Number(item.plus))}</span>
                  <span>CYL {format(Number(item.cylinder))}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-history">Saved configurations will appear here.</p>
        )}
      </section>

      <footer className="site-footer">
        <span>visio. · VISION SIMULATOR</span>
        <span>For educational use only</span>
      </footer>
    </main>
  );
}
