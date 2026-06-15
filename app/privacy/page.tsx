'use client'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: January 2024</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
            <p>Awards (&quot;we&quot; or &quot;us&quot; or &quot;our&quot;) operates the Awards voting platform. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, and authentication credentials</li>
              <li><strong>Voting Data:</strong> Information about votes cast and event participation</li>
              <li><strong>Usage Data:</strong> Browser type, IP address, and pages visited</li>
              <li><strong>Device Data:</strong> Device type, operating system, and unique device identifiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Use of Data</h2>
            <p>Awards uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features</li>
              <li>To provide customer care and support</li>
              <li>To gather analysis or valuable information so we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Security of Data</h2>
            <p>The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Email: privacy@awards.com</li>
              <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
