import {
  html,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  customElement,
  CSSResult,
  css,
} from "lit-element";
import "@material/mwc-button";
import "@polymer/paper-card/paper-card";
import "@polymer/paper-toggle-button/paper-toggle-button";
import "@polymer/paper-item/paper-item-body";
// tslint:disable-next-line
import { PaperToggleButtonElement } from "@polymer/paper-toggle-button/paper-toggle-button";

import { fireEvent } from "../../../common/dom/fire_event";
import { HomeAssistant } from "../../../types";
import {
  connectCloudRemote,
  disconnectCloudRemote,
  CloudStatusLoggedIn,
} from "../../../data/cloud";
import { showCloudCertificateDialog } from "./show-dialog-cloud-certificate";

@customElement("cloud-remote-pref")
export class CloudRemotePref extends LitElement {
  public hass?: HomeAssistant;
  public cloudStatus?: CloudStatusLoggedIn;

  static get properties(): PropertyDeclarations {
    return {
      hass: {},
      cloudStatus: {},
    };
  }

  protected render(): TemplateResult | void {
    if (!this.cloudStatus) {
      return html``;
    }

    const {
      remote_connected,
      remote_domain,
      remote_certificate,
    } = this.cloudStatus;

    if (!remote_certificate) {
      return html`
        <paper-card heading="Remote Control">
          <div class="preparing">
            Remote access is being prepared. We will notify you when it's ready.
          </div>
        </paper-card>
      `;
    }

    return html`
      <paper-card heading="Remote Control">
        <paper-toggle-button
          .checked="${remote_connected}"
          @change="${this._toggleChanged}"
        ></paper-toggle-button>
        <div class="card-content">
          Home Assistant Cloud provides a secure remote connection to your
          instance while away from home. Your instance
          ${remote_connected ? "is" : "will be"} available at
          <a href="https://${remote_domain}" target="_blank">
            https://${remote_domain}</a
          >.
        </div>
        <div class="card-actions">
          <a href="https://www.nabucasa.com/config/remote/" target="_blank">
            <mwc-button>Learn how it works</mwc-button>
          </a>
          ${remote_certificate
            ? html`
                <div class="spacer"></div>
                <mwc-button @click=${this._openCertInfo}>
                  Certificate Info
                </mwc-button>
              `
            : ""}
        </div>
      </paper-card>
    `;
  }

  private _openCertInfo() {
    showCloudCertificateDialog(this, {
      certificateInfo: this.cloudStatus!.remote_certificate!,
    });
  }

  private async _toggleChanged(ev) {
    const toggle = ev.target as PaperToggleButtonElement;

    try {
      if (toggle.checked) {
        await connectCloudRemote(this.hass!);
      } else {
        await disconnectCloudRemote(this.hass!);
      }
      fireEvent(this, "ha-refresh-cloud-status");
    } catch (err) {
      toggle.checked = !toggle.checked;
    }
  }

  static get styles(): CSSResult {
    return css`
      paper-card {
        display: block;
      }
      .preparing {
        padding: 0 16px 16px;
      }
      a {
        color: var(--primary-color);
      }
      paper-card > paper-toggle-button {
        position: absolute;
        right: 8px;
        top: 16px;
      }
      .card-actions {
        display: flex;
      }
      .spacer {
        flex-grow: 1;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "cloud-remote-pref": CloudRemotePref;
  }
}
