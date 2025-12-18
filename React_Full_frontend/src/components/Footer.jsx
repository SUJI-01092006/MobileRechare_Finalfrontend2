// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <h3>Prepaid Online Airtel Recharge </h3>

        <p>
          Airtel is one of the most prevalent networks in India. Bharti Airtel/Airtel was founded by Sunil Bharti Mittal many decades ago...
          {/* Replace the above with the full long text you posted earlier — truncated here for brevity. */}
        </p>

        <h4>FAQs</h4>
        <p>
          1. How is Airtel better than other operators?
          <br />
          2. Which is the best website/platform to Airtel prepaid recharge online? ...
        </p>

        <hr />

        <p className="footer-bottom">© {new Date().getFullYear()} Recharge – All Rights Reserved.</p>
      </div>
    </footer>
  );
}
