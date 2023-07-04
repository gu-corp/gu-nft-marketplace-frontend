import Flex from "./Flex";
import Text from "./Text";
import Image from "next/image";

const Value = ({ type, value, size = 11, fontSize = 16 }: any) => (
  <Flex align="center">
    <Image
      alt=""
      style={{ width: size }}
      src={type == "weth" ? "/weth.png" : "/eth.png"}
    />
    {false && <Text css={{ fontFamily: "arial" }}>Ξ</Text>}
    <Text style="subtitle1" css={{ marginLeft: "$1", fontSize }}>
      {value || "---"}
    </Text>
  </Flex>
);

export default Value;
