const AboutPage = () => {
  return (
    <div id="about" className="mx-auto max-w-4xl p-6">
      <h1 className="text-dark-charcoal mb-6 text-3xl font-bold">
        About This Project
      </h1>

      <div className="text-gunmetal space-y-4">
        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            Overview
          </h2>
          <p className="leading-relaxed">
            This is a university project developed for an AI course,
            demonstrating real-time motion detection using computer vision
            techniques. The application uses your device's camera to monitor and
            detect any movements in the video feed.
          </p>
        </section>

        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            How It Works
          </h2>
          <p className="leading-relaxed">
            The system analyzes video frames from your webcam to identify
            motion. It is particularly sensitive to sudden changes in lighting,
            such as turning on a light bulb or opening curtains. However, it is
            designed to be resistant to gradual lighting changes like dawn or
            dusk, preventing false alarms during natural light transitions.
          </p>
        </section>

        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            Features
          </h2>
          <ul className="list-inside list-disc space-y-2 leading-relaxed">
            <li>Real-time motion detection using your camera</li>
            <li>Smart detection that ignores gradual lighting changes</li>
            <li>User authentication with email and full name</li>
            <li>Local storage for user preferences</li>
            <li>
              Optional email notifications when motion is detected
              (enable/disable via checkbox)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            Getting Started
          </h2>
          <p className="leading-relaxed">
            To use this application, simply log in with your email and full
            name. You can choose whether to receive email notifications when
            motion is detected by checking or unchecking the notification
            option. Your preferences will be saved locally in your browser.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
