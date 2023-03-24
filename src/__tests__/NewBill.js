/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import { ROUTES } from "../constants/routes.js";
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'

// Créer une fonction mock pour remplacer window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe('When I change file input', () => {
      jest.spyOn(window, "alert")
      test("Then it should upload a new file", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
            })
        );

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null;
        const NewCurrentBill = new NewBill({ document, onNavigate, localStorage: window.localStorage, store })

        const handleChangeFile = jest.fn(NewCurrentBill.handleChangeFile)
        const file = screen.getByTestId("file")
        file.addEventListener("change", handleChangeFile)
        userEvent.upload(file, new File(["hello"], "hello.png", { type: "image/png" }))
        expect(handleChangeFile).toHaveBeenCalled()
      })
    })
  })
})
