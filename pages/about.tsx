import { Text } from "components/primitives";
import packageJson from "../package.json";

const IndexPage = () => { 
  return <div>
    <Text style="h2">About</Text>
    <br />
    <Text style="h4">Version: {packageJson.version}</Text>
  </div>
}

export default IndexPage