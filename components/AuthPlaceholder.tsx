export default function AuthPlaceholder() {
  return (
    <section className="px-6 py-24 max-w-xl mx-auto text-center">
      <h3 className="text-2xl mb-4">
        Ready to Transform Your Space?
      </h3>

      <p className="mb-6">
        Sign up or sign in to begin your assessment.
      </p>

      <button
        className="px-6 py-3 border rounded"
        onClick={() => console.log('Auth coming next')}
      >
        Sign Up To Begin Your Assessment
      </button>
    </section>
  )
}
