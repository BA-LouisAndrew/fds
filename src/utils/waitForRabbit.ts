import waitPort from "wait-port"
export const waitForRabbit = async (url: string) => {
  const [host, port] = url.split("://")[1].split(":")

  console.log({ host, port })
  console.log("> Waiting for RABBITMQ to be available")
  console.log(`> Waiting for ${url}`)

  return waitPort({
    host,
    port: parseInt(port),
    timeout: 5 * 60 * 1000,
  })
}
