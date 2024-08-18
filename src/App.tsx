import { useState } from "react"

function App() {
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState("")

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!userInput) {
      alert("Please insert your input")
      return
    }

    setIsLoading(true)
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPEN_ROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-3.5-turbo",
        "messages": [
          { "role": "system", "content": "You are a very intelligent psychiatrist ai and only answer to question regarding mental health only and provide the best answer for the user as psychiatrist. Don't answer anything that have nothing to do with mental health" },
          { "role": "user", "content": userInput },
        ],
      })
    })
      .then(response => response.json()) // Parse the response as JSON
      .then(data => {
        // console.log(data)
        const content = data.choices[0]?.message?.content; // Extract the content
        setMsg(content);
        setIsLoading(false)
        // console.log(content); // Do something with the content (e.g., set it in state)
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert("Error fetching data")
        setIsLoading(false)
      });
  }

  return (
    <section className="flex flex-col space-y-5 items-center justify-center min-h-screen">
      {(!msg || isLoading) && <h1>Nothing generate yet</h1>}
      {isLoading ? <h1>Loading</h1> : <h1 className="px-20">{msg}</h1>}
      <form onSubmit={onSubmit} className="flex flex-col items-center space-y-3">
        <div>
          <label htmlFor="username" className="block text-sm text-gray-500 dark:text-gray-300">User input</label>
          <input
            onChange={(e) => setUserInput(e.target.value)}
            type="text" placeholder="Insert your input"
            className="block  mt-2 w-full placeholder-gray-400/70 dark:placeholder-gray-500 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-300" />
        </div>
        <button type="submit" className="px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80">
          Submit
        </button>
      </form>
    </section>
  )
}

export default App
