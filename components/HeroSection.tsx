export default function HeroSection() {
  return (
    <section className="px-6 py-24 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-semibold mb-4">
        The Sentient Home
      </h1>

      <h2 className="text-2xl mb-6">
        NeuroDesign™ Sensory Intelligence for Everyday Living
      </h2>

      <p className="mb-8 text-lg">
        Discover how your home environment affects your wellbeing.
        Get personalised recommendations based on neuropsychology principles
        to create spaces that enhance focus, reduce stress, and improve your
        quality of life.
      </p>

      <button
        className="px-6 py-3 border rounded"
        onClick={() => console.log('Begin assessment clicked')}
      >
        Take Assessment
      </button>
    </section>
  )
}
