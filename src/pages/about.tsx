const AboutPage = () => {
  return (
    <div id="about" className="container mx-auto my-5 max-w-4xl">
      <h1 className="text-dark-charcoal mb-6 text-3xl font-bold">
        About Alarm Camera
      </h1>

      <div className="text-gunmetal space-y-4">
        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            Overview
          </h2>
          <p className="leading-relaxed">
            Alarm Camera is an advanced real-time motion detection system built
            with React and TypeScript. This application transforms your device's
            camera into an intelligent security monitor using sophisticated
            computer vision algorithms. It employs background subtraction,
            adaptive thresholding, and exponential moving averages to accurately
            detect motion while minimizing false positives.
          </p>
        </section>

        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            Advanced Detection Technology
          </h2>
          <p className="leading-relaxed">
            The system uses a multi-layered approach for motion detection:
          </p>
          <ul className="ml-4 list-inside list-disc space-y-1 leading-relaxed">
            <li>
              <strong>Background Modeling:</strong> Continuously learns and
              adapts to the background using exponential moving average (α =
              0.02)
            </li>
            <li>
              <strong>Grayscale Processing:</strong> Converts video frames to
              grayscale for efficient analysis
            </li>
            <li>
              <strong>Adaptive Thresholding:</strong> Dynamically adjusts
              sensitivity based on environmental conditions
            </li>
            <li>
              <strong>Motion Confirmation:</strong> Requires multiple
              consecutive frames to confirm motion and reduce false alarms
            </li>
            <li>
              <strong>Sudden Light Detection:</strong> Specially designed to
              detect rapid lighting changes
            </li>
            <li>
              <strong>Smart Pause System:</strong> Temporarily disables
              detection after alerts to prevent spam
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            Key Features
          </h2>
          <ul className="list-inside list-disc space-y-2 leading-relaxed">
            <li>
              <strong>Real-time Processing:</strong> Processes video at 10 FPS
              with minimal latency
            </li>
            <li>
              <strong>Intelligent Background Learning:</strong> Automatically
              adapts to gradual environmental changes
            </li>
            <li>
              <strong>Multi-frame Detection:</strong> Captures before/after
              images, background reference, and zoomed detection area
            </li>
            <li>
              <strong>Bounding Box Detection:</strong> Identifies and highlights
              the exact area where motion occurred
            </li>
            <li>
              <strong>Audio Alerts:</strong> Plays customizable beep sounds when
              motion is detected
            </li>
            <li>
              <strong>Data Persistence:</strong> Stores detection history in
              IndexedDB for offline access
            </li>
            <li>
              <strong>Export Functionality:</strong> Export detection data as
              JSON for analysis
            </li>
            <li>
              <strong>User Authentication:</strong> Simple email-based login
              with notification preferences
            </li>
            <li>
              <strong>Responsive Design:</strong> Works seamlessly on desktop
              and mobile devices
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Processing Parameters:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Frame Rate: 10 FPS</li>
                <li>• Background Alpha: 0.02</li>
                <li>• EMA Alpha: 0.05</li>
                <li>• Sensitivity Factor: 1.8</li>
                <li>• Confirmation Frames: 2</li>
                <li>• Pause Duration: 3000ms</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Technologies Used:</h3>
              <ul className="space-y-1 text-sm">
                <li>• React 19 with TypeScript</li>
                <li>• Canvas API for image processing</li>
                <li>• WebRTC MediaDevices API</li>
                <li>• IndexedDB for data storage</li>
                <li>• Web Audio API for alerts</li>
                <li>• Tailwind CSS for styling</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            How to Use
          </h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            <li>
              <strong>Login:</strong> Enter your email address and choose
              notification preferences
            </li>
            <li>
              <strong>Grant Camera Access:</strong> Allow the application to
              access your device's camera
            </li>
            <li>
              <strong>Enable Detection:</strong> Check "Enable Detection" to
              start monitoring (5-second countdown)
            </li>
            <li>
              <strong>Configure Storage:</strong> Optionally enable "Save
              detections to storage" for persistent history
            </li>
            <li>
              <strong>Reset Background:</strong> Click "Reset" if the
              environment changes significantly
            </li>
            <li>
              <strong>View Results:</strong> Monitor the detection list showing
              timestamps, images, and statistics
            </li>
            <li>
              <strong>Export Data:</strong> Use "Export All" to download
              detection data for analysis
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-dark-charcoal mb-2 text-xl font-semibold">
            Perfect For
          </h2>
          <ul className="list-inside list-disc space-y-1 leading-relaxed">
            <li>Home security monitoring</li>
            <li>Office space surveillance</li>
            <li>Pet activity tracking</li>
            <li>Computer vision research and education</li>
            <li>IoT and smart home integration</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
