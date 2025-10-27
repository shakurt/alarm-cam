const Footer = () => {
  return (
    <footer className="bg-card py-2 text-gray-300">
      <div className="container text-center">
        <p className="text-xs">
          &copy; {new Date().getFullYear()}{" "}
          <a
            href="https://github.com/shakurt/alarm-cam"
            target="_blank"
            className="underline"
          >
            Camera Alarm
          </a>
          . All rights reserved.
          {" • "}Developed by{" "}
          <span className="font-semibold">ThePrimeShak</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
