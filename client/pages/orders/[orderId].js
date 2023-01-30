import Router from "next/router";
import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import { useRequest } from "../../hooks/use-request";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push("/orders"),
  });
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = (new Date(order.expiresAt) - new Date()) / 1000;
      setTimeLeft(Math.round(msLeft));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => clearInterval(timerId);
  }, []);

  if (timeLeft <= 0) {
    return <div>Order expired!</div>;
  }

  return (
    <div>
      <h3>Time left to pay: {timeLeft} seconds</h3>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51MVg1qIdxze1rIecDzxxDvBWrQjcXegoCMPfm9eq33MOIsyEtOhGZPFPVFYEcJbWnp4K7mesfhXMItfDL4fJocTz00cAdCZOfl"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client, currentUser) => {
  const { orderId } = context.query;
  const { data: order } = await client.get(`/api/orders/${orderId}`);
  return { order, currentUser };
};

export default OrderShow;
