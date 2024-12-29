package routes

import (
	"backend/httperror"

	"github.com/casbin/casbin/v2"
)

// We define the model here so that it will be included in the built executable
var AuthModel = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = keyMatch(r.sub, p.sub) && keyMatch5(r.obj, p.obj) && r.act == p.act`

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