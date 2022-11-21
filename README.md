# Prelude Build

<a href="https://www.preludesecurity.com/">Prelude Build</a> is an easy-to-use IDE - purpose built for authoring, testing and verifying security tests for use in real environments. Our goal is to provide a consistent and repeatable way to write, verify and deploy tests for any scale.

<IMAGE>

Build exists to streamline taking a security test from ideation to production. Security testing today is usually restricted to development environments and the results are extrapolated to the rest of the infrastructure.

Prelude Build can be broken down into the following functions:

- Authorship - multi-language support for creating a security test and managing multiple files using tabs.
- Storage - cloud storage for your files, including the ability to push and pull new tests. 
- Validation - Build connects to a more powerful Compute server, containing the runtime environment for compiling, scanning and publishing your code.
- Deployment - generate deployment URLs - pre-signed download links to your test which are usable for up to 10 minutes. Take a URL and plug it into any execution engine or C2 in order to run it. Or use Detect.

<img width="801" alt="image" src="https://user-images.githubusercontent.com/813716/203120340-5731d470-0395-465a-bb6e-0714530eceae.png">


## Get started

Build can be used in two forms: a user interface and the Prelude CLI.

You may opt for one or both, depending on your workflow. Both are fully open-source. Build is designed to be run anywhere: desktops, laptops, Chromebooks, tablets and more.

<h4>User Interface</h4>

The Build UI is a Progressive Web Application (PWA) - which means it is a website that functions as a desktop application. This modern deployment mechanism allows the best of both worlds: you can run it as a native desktop experience (where the icon shows up in your dock) but you don't need to actually install it, as it's just browser technology under the covers.

PWA's can run anywhere, on any device you can load a browser. To use the GUI - click on the "Launch Prelude Build" CTAs on https://www.preludesecurity.com/.

<h4>Prelude CLI</h4>

The Prelude Command Line Interface (CLI) supplies programmatic access to the full suite of APIs. It is written in Python and as such, is multi-platform and can install anywhere Python exists through PIP.

          pip install prelude-cli
          # Confirm it's installed correctly
          prelude --help
 
 Once installed, you can engage the CLI through the 'prelude' command.
 
 To view a list of commands and detailed instructions on using the CLI - view the doc page here: https://docs.prelude.org/v2/docs/prelude-cli
 
 

