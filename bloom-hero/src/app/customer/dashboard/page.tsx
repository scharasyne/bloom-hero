import NavBar from "@/components/navbar";

export default function HomePage() {
  return (
    <main>
      <NavBar type="customer" />
      <h1>BloomHero</h1>

      <p>Welcome to BloomHero.</p>
      <p>This is a temporary landing page for Customer Dashboard.</p>

      <hr />

      <p>If you can see this page, routing is working correctly.</p>
    </main>
  )
}