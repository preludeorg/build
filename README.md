# Prelude Build

<a href="https://www.preludesecurity.com/">Prelude Build</a> is an easy-to-use IDE - purpose built for authoring, testing and verifying security tests for use in real environments. Our goal is to provide a consistent and repeatable way to write, verify and deploy tests for any scale.

![Compile, download and run a VST in a lightweight probe](https://user-images.githubusercontent.com/813716/206263029-cd6a0773-3e0e-42a2-bc6c-f5d91dd542de.gif)

## What is Prelude?

Prelude is a technology company that helps organizations proactively ask questions of their security systems to advance their defenses. Prelude authors several different tools that work together to help organizations design and deploy questions at scale.

<ol>
          <li><a href="https://www.preludesecurity.com/products/operator">Prelude Operator</a>: Perform realistic security assessments on security systems</li>
          <li><a href="https://www.preludesecurity.com/products/build">Prelude Build</a>: Security test authoring</li>
          <li><a href="https://www.preludesecurity.com/products/detect">Prelude Detect</a>: Continuous security testing</li>
</ol>

## What is Build?

Build exists to streamline taking a security test from ideation to production. Security testing today is usually restricted to development environments and the results are extrapolated to the rest of the infrastructure.

Prelude Build can be broken down into the following functions:

- Authorship - multi-language support for creating a security test and managing multiple files using tabs.
- Storage - cloud storage for your files, including the ability to push and pull new tests. 
- Validation - Build connects to a more powerful Compute server, containing the runtime environment for compiling, scanning and publishing your code.
- Deployment - generate deployment URLs - pre-signed download links to your test which are usable for up to 10 minutes. Take a URL and plug it into any execution engine or C2 in order to run it. Or use Detect.

## Get started

Build can be used in two forms: a GUI and the Prelude CLI.

You may opt for one or both, depending on your workflow. Both are fully open-source. Build is designed to be run anywhere: desktops, laptops, Chromebooks, tablets and more.

<h4>User Interface</h4>

The Build UI is a <a href="https://web.dev/progressive-web-apps/">Progressive Web Application (PWA)</a> - which means it is a website that functions as a desktop application. This modern deployment mechanism allows the best of both worlds: you can run it as a native desktop experience (where the icon shows up in your dock) but you don't need to actually install it, as it's just browser technology under the covers.

PWA's can run anywhere, on any device you can load a browser. To use the GUI - click on the "Launch Prelude Build" CTAs on https://www.preludesecurity.com/.

### Quickstart

1. [Register new account](https://docs.prelude.org/docs/build-getting-started#register-new-account)
2. [List security tests](https://docs.prelude.org/docs/build-getting-started#list-security-tests)
3. [List Variants](https://docs.prelude.org/docs/build-getting-started#list-variants)
4. [Create a new security test](https://docs.prelude.org/docs/build-getting-started#create-a-new-security-test)
5. [Create a new variant](https://docs.prelude.org/docs/build-getting-started#create-a-new-variant)
6. [Compile variant](https://docs.prelude.org/docs/build-getting-started#compile-variant)
7. [Generate URL for complied variant](https://docs.prelude.org/docs/build-getting-started#generate-url-for-complied-variant)
8. [List all complied variants](https://docs.prelude.org/docs/build-getting-started#list-all-complied-variants)

<h4>Prelude CLI</h4>

The Prelude Command Line Interface (CLI) supplies programmatic access to the full suite of APIs. It is written in Python and as such, is multi-platform and can install anywhere Python exists through PIP.

          pip install prelude-cli
          # Confirm it's installed correctly
          prelude --help
 
 Once installed, you can engage the CLI through the 'prelude' command.
 
 To view a list of commands and detailed instructions on using the CLI - view the doc page here: https://docs.prelude.org/v2/docs/prelude-cli
 
<h4>Prelude Service</h4>

The Prelude CLI is designed to interact with any route on the Prelude Service API.

The CLI is built on top of the Prelude SDK, a Python wrapper around the Prelude Service. The SDK contains the same functions (IAM, Build, Detect) as the CLI - but it also includes the actual REST API code too.

There is also a JavaScript SDK available for integration into web applications. All SDK’s are open-source, made available on GitHub.
The SDK can be used to build your own programmatic access to the Prelude Service.

You can engage with these API endpoints manually (think cURL), semi-automated (through the CLI) or fully automated (through the Prelude SDK).

