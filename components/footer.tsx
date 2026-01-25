export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-serif font-bold mb-4">Product</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#" className="hover:opacity-100">
                  Courses
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  About
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-bold mb-4">Learn</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#" className="hover:opacity-100">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#" className="hover:opacity-100">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Terms
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-bold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <a href="#" className="hover:opacity-100">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100">
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 pt-8 text-center text-sm opacity-60">
          <p>&copy; 2025 Moon Learning. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
