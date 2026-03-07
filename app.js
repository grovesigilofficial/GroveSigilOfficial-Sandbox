const SUPABASE_URL = "YOUR_SUPABASE_URL"
const SUPABASE_KEY = "YOUR_ANON_KEY"

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

const out = document.getElementById("output")

async function signup(){

  const email = document.getElementById("signup-email").value
  const password = document.getElementById("signup-password").value

  const {data,error} = await client.auth.signUp({
    email,
    password
  })

  if(error){
    out.textContent = error.message
    return
  }

  out.textContent = "Signup successful"
}

async function login(){

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  const {data,error} = await client.auth.signInWithPassword({
    email,
    password
  })

  if(error){
    out.textContent = error.message
    return
  }

  out.textContent = "Logged in"
}

async function logout(){

  await client.auth.signOut()

  out.textContent = "Logged out"
}
