
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


interface FormElements extends HTMLFormControlsCollection {
  room: HTMLInputElement
}

export type LoginFormElements = HTMLFormElement & {
  readonly elements: FormElements
}

export function LoginForm() {
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Othello</CardTitle>
        <CardDescription>
          Entre na sala de jogo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="room">Sala</Label>
            <Input id="room" placeholder="PPD123" required />
          </div>
          <Button type="submit" className="w-full">
            Entrar na sala
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
