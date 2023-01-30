import Router from "next/router";
import { useRequest } from "../../hooks/use-request";

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: "/api/orders",
    method: "post",
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push("/orders/[orderIs]", `/orders/${order.id}`),
  });

  return (
    <>
      <h1>{ticket.title}</h1>
      <h4>{ticket.price} $</h4>
      {errors}
      <button className="btn btn-primary" onClick={(e) => doRequest()}>
        Purcahse
      </button>
    </>
  );
};

TicketShow.getInitialProps = async (ctx, client, currentUser) => {
  const { ticketId } = ctx.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);
  return { ticket: data };
};

export default TicketShow;
