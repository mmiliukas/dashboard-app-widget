import { createClient } from '@wix/sdk';
import { site } from '@wix/site';

const styles = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :host {
      display: block;
      max-width: 400px;
      margin: auto;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      padding: 28px;
    }

    h2 {
      font-size: 18px;
      margin-bottom: 24px;
    }

    label {
      display: inline-block;
      margin-bottom: 8px;
    }

    input {
      width: 66%;
      padding: 12px;
    }

    button {
      background: #3845db;
      color: white;
      padding: 8px 12px;
      border: none;
      cursor: pointer;
      width: 33%;
    }

    .required::after {
      content: ' *'
    }

    #formInput {
      display: flex;
      gap: 8px;
    }
  </style>
`;

const formHtml = `
  <div>
    <h2>Leave your email and join our mailing list</h2>
    <label for="email" class="required">Your Email Address:</label>
    <div id="formInput">
      <input type="email" id="email" placeholder="Enter your email" required>
      <button id="subscribeBtn">Subscribe</button>
    </div>
  </div>
`;

class MyAwesomeEmailTemplates extends HTMLElement {
    static observedAttributes = ["wixconfig", "wixConfig"];

  accessToken: any;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    };

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        console.log('attributeChangedCallback', name, oldValue, newValue);
    };

    connectedCallback() {
      console.log(this.attributes);

        this.shadowRoot!.innerHTML = `
      ${styles}
      ${formHtml}
    `;

        this.shadowRoot!.getElementById('subscribeBtn')!.addEventListener('click', () => this.subscribe());
    };

    accessTokenListener(param: any) {
      this.accessToken = param;
      console.log('accessTokenListener', param);
    }

    async subscribe() {
        console.trace('subscribe() called');
  
        const client = createClient({
          host: site.host({ applicationId: '240a79b4-cc3c-4df2-9cff-d171d4f18cdf' }),
          auth: site.auth(this.accessToken),
        });
      

        const headers = await client.auth.getAuthHeaders();
        const authorization = headers.headers["Authorization"];
        
        const data = JSON.parse(JSON.parse(atob(authorization.split(".")[3])).data);
        const instanceId = data.instance.instanceId;

        const emailInput = this.shadowRoot!.getElementById('email') as any;
        const email = emailInput!.value;

        client.fetchWithAuth(
          'https://dashboard-app-server-isy0.onrender.com/subscriptions/by-instance-id?instanceId=' + instanceId,
          {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: { 'Content-Type': 'application/json' }
          }
        );
    };
};

customElements.define('my-awesome-email-templates', MyAwesomeEmailTemplates);