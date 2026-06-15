'use client'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: January 2024</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the Awards platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Awards&apos;s web site for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose, or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on Awards&apos;s web site</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Disclaimer</h2>
            <p>The materials on Awards&apos;s web site are provided without any representations or warranties, express or implied. Awards makes no representations or warranties whatsoever with respect to any such sites or materials accessible by hyperlink from this web site.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitations of Liability</h2>
            <p>In no event shall Awards or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Awards&apos;s Internet web site, even if Awards or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Accuracy of Materials</h2>
            <p>The materials appearing on Awards&apos;s web site could include technical, typographical, or photographic errors. Awards does not warrant that any of the materials on its web site are accurate, complete, or current. Awards may make changes to the materials contained on its web site at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Information</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Email: legal@awards.com</li>
              <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
