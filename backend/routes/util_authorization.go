package routes

import (
	"backend/httperror"

	"github.com/casbin/casbin/v2"
)

func addAuthPolicies(policies [][]string, e casbin.IEnforcer) error {
	_, err := e.AddPoliciesEx(policies) // Adds the policies to RAM for quick access
	if err != nil {
		return httperror.NewInternalServerError(err)
	}
	err = e.SavePolicy() // Saves the policies to the DB for persistence
	if err != nil {
		return httperror.NewInternalServerError(err)
	}

	return nil
}