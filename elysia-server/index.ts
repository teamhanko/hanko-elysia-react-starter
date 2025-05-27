import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

const app = new Elysia()

const hankoApiUrl = process.env.HANKO_API_URL

app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}))

const validateToken = async (token: string) => {
    if (!token || token.length === 0) return false

    try {
      const validationOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_token: token }),
      }
      // Use the hanko /sessions/validate api endpoint 
      const validationResponse = await fetch(
        `${hankoApiUrl}/sessions/validate`,
        validationOptions
      )
  
      if (!validationResponse.ok) return false
  
      const validationData: any = await validationResponse.json()
      return validationData.is_valid === true
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
};

app.get("/validate", () => "Validation Succesfull!", {
    beforeHandle: async ({ set, cookie: { hanko } }) => {
        const token = hanko?.value || ""
      
        if (!token || !(await validateToken(token))) {
          set.status = 401
          return 'Unauthorized'
        }
      }
  });
  

app.listen(5001)
console.log('Server is now running...');